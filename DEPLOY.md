# Deployment Guide for Bookshelves Application

This guide outlines the steps to deploy the Bookshelves application (Angular frontend, Java/Spring Boot backend, and SQLite database) to Digital Ocean using `doctl` with NixOS. Optionally, Terraform can be used for infrastructure as code.

## Prerequisites

- Digital Ocean account and API token
- `doctl` installed on your system or available in the Nix environment
- NixOS environment set up with necessary tools
- Custom NixOS image uploaded to Digital Ocean (see Digital Ocean documentation for uploading custom images)

## Deployment Steps

### 0. Set Up Nix Flake Environment

- Ensure you are in the root directory of the project where the `flake.nix` file is located.
- Enter the Nix development environment using the flake:

  ```bash
  nix develop
  ```

- This will set up the environment with all necessary tools and dependencies defined in `flake.nix`.

### 1. Set Up Digital Ocean Droplet

- Use `doctl` to create a new Droplet with a custom NixOS image:

  ```bash
  doctl compute image create nixos-custom --region alt1 --image-url=https://channels.nixos.org/nixos-25.05/latest-nixos-minimal-x86_64-linux.iso --image-description 'Custom NixOS image'

  doctl compute droplet create bookshelves --image <your-custom-nixos-image-id> --size s-1vcpu-1gb --region nyc1 --ssh-keys <your-ssh-key-id> --wait
  ```

- Replace `<your-custom-nixos-image-id>` with the ID of your uploaded NixOS image. You can find this ID using `doctl compute image list --public false`.
- Alternatively, use Terraform to define and create the Droplet (see `terraform/` directory if available).

### 2. Prepare the Environment on the Droplet

- SSH into the Droplet:

  ```bash
  ssh root@<droplet-ip>
  ```

- Install necessary dependencies using Nix (if not already included in your custom image):

  ```bash
  nix-env -iA nixos.nodejs nixos.jdk17 nixos.nginx nixos.sqlite
  ```

### 3. Build and Deploy Frontend (Angular)

- Build the Angular app locally within the Nix flake environment:

  ```bash
  cd frontend && npm install && npm run build
  ```

- Transfer the built files to the Droplet:

  ```bash
  scp -r frontend/dist/frontend/* root@<droplet-ip>:/var/www/html/
  ```

### 4. Deploy Backend (Java/Spring Boot)

- Build the Spring Boot application locally within the Nix flake environment:

  ```bash
  cd backend && mvn clean package -DskipTests
  ```

- Transfer the JAR file to the Droplet:

  ```bash
  scp backend/target/*.jar root@<droplet-ip>:/opt/bookshelves/app.jar
  ```

- Run the backend as a service:

  ```bash
  cat > /etc/systemd/system/bookshelves.service << EOF
  [Unit]
  Description=Bookshelves Backend Service
  After=network.target

  [Service]
  Type=simple
  User=root
  WorkingDirectory=/opt/bookshelves
  ExecStart=/usr/bin/java -jar /opt/bookshelves/app.jar
  Restart=always

  [Install]
  WantedBy=multi-user.target
  EOF
  systemctl daemon-reload
  systemctl enable bookshelves
  systemctl start bookshelves
  ```

### 5. Set Up SQLite Database

- Create a directory for the database on the Droplet:

  ```bash
  mkdir -p /opt/bookshelves/db
  chown -R root:root /opt/bookshelves/db
  ```

- Ensure the backend is configured to use `/opt/bookshelves/db/bookshelves.db` as the SQLite database path.

### 6. Configure Nginx

- Configure Nginx to serve the frontend and proxy API requests to the backend:

  ```bash
  cat > /etc/nginx/sites-available/bookshelves << EOF
  server {
      listen 80;
      server_name <your-domain-or-ip>;

      location / {
          root /var/www/html;
          try_files \$uri \$uri/ /index.html;
          index index.html;
      }

      location /api/ {
          proxy_pass http://localhost:8080/;
          proxy_http_version 1.1;
          proxy_set_header Upgrade \$http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host \$host;
          proxy_cache_bypass \$http_upgrade;
      }
  }
  EOF
  ln -s /etc/nginx/sites-available/bookshelves /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
  ```

### 7. Set Up Domain and SSL (Optional)

- Point your domain to the Droplet's IP address using Digital Ocean's DNS management.
- Install Certbot for SSL:

  ```bash
  nix-env -iA nixos.certbot
  certbot --nginx -d <your-domain>
  ```

### 8. Automate Deployment (Optional)

- Set up a CI/CD pipeline using GitHub Actions or similar to automate builds and deployments.
- Example GitHub Actions workflow can be found in `.github/workflows/deploy.yml` if set up.

## Troubleshooting

- Check logs for backend issues:

  ```bash
  journalctl -u bookshelves -f
  ```

- Check Nginx error logs:

  ```bash
  tail -f /var/log/nginx/error.log
  ```

## Notes

- Ensure proper firewall settings are in place (e.g., using `ufw` or Digital Ocean's firewall) to allow traffic on ports 80 and 443.
- Regularly update dependencies and rebuild the application for security patches.
- Ensure your custom NixOS image is properly configured with SSH access and necessary base packages before deployment.
- The Nix flake in the root directory (`flake.nix`) provides a reproducible environment for building and deploying the application.
