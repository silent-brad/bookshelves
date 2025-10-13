{
  description =
    "Book sharing web app with Spring Boot, Angular, SQLite, and Nix";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    backend.url = "path:./backend";
    frontend.url = "path:./frontend";
    proxy.url = "path:./proxy";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, backend, frontend, proxy, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        packages = {
          default = pkgs.stdenv.mkDerivation {
            pname = "bookshelves";
            version = "0.0.1";

            unpackPhase = "true";

            installPhase = ''
              mkdir -p $out/bin $out/static $out/data

              # Copy backend
              cp -r ${backend.packages.${system}.default}/bin/. $out/bin/

              # Copy frontend build
              cp -r ${frontend.packages.${system}.default}/. $out/static/

              # Copy proxy bin and config
              cp -r ${proxy.packages.${system}.default}/bin/. $out/bin/
              cp -r ${proxy.packages.${system}.default}/data/. $out/data/
            '';
          };

          dockerImage = pkgs.dockerTools.buildLayeredImage {
            name = "registry.fly.io/bookshelves:latest";
            tag = "latest";

            contents = with pkgs; [
              self.packages.${system}.default
              bash
              coreutils
              sqlite
            ];

            extraCommands = ''
              # Create necessary directories
              mkdir -p data tmp uploads

              # Copy the database file if it exists
              if [ -f ${toString ./.}/bookshelves.db ]; then
                cp ${toString ./.}/bookshelves.db data/bookshelves.db
              else
                # Create empty database file that the app can initialize
                touch data/bookshelves.db
              fi

              # Copy existing uploads if they exist
              if [ -d ${toString ./.}/uploads ]; then
                cp -r ${toString ./.}/uploads/* uploads/ || true
              fi

              # Set proper permissions
              chmod 755 data uploads
              chmod 666 data/bookshelves.db
              chmod 1777 tmp
            '';

            config = {
              Cmd = [
                "${pkgs.bash}/bin/bash"
                "-c"
                "cd /data && ${
                  self.packages.${system}.default
                }/bin/start-proxy & ${self.packages.${system}.default}/bin/app"
              ];
              WorkingDir = "/data";
              ExposedPorts = { "8080/tcp" = { }; };
              Env = [
                "DB_URL=jdbc:sqlite:/data/bookshelves.db"
                "FRONTEND_PATH=${self.packages.${system}.default}/static"
                "SERVER_PORT=8000"
                "PROXY_PORT=8080"
                "JAVA_TOOL_OPTIONS=-Djava.io.tmpdir=/tmp"
              ];
            };
          };
        };

        devShells.default = pkgs.mkShell {
          inputsFrom = [
            backend.devShells.${system}.default
            frontend.devShells.${system}.default
            proxy.devShells.${system}.default
          ];
        };

        checks = pkgs.lib.mergeAttrs backend.checks.${system}
          (pkgs.lib.mergeAttrs frontend.checks.${system}
            (proxy.checks.${system} or { }));
      });
}
