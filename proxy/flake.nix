{
  description = "Caddy reverse proxy for bookshelves";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "proxy";
          version = "0.0.1";
          src = ./.;

          buildInputs = [ pkgs.caddy pkgs.gettext ];

          installPhase = ''
            mkdir -p $out/bin $out/data
            cp Caddyfile.template $out/data/Caddyfile.template
            cat > $out/bin/start-proxy <<EOF
            #!/usr/bin/env ${pkgs.bash}/bin/bash
            #\$(dirname "\$0")/app &
            echo "Starting reverse proxy"
            TEMPLATE_PATH="\$(dirname "\$0")/../data/Caddyfile.template"
            CONFIG_PATH="/tmp/Caddyfile"
            export PROXY_PORT=\''${PROXY_PORT:-8080}
            export SERVER_PORT=\''${SERVER_PORT:-8000}
            export FRONTEND_PATH="\$(dirname "\$0")/../static"
            ${pkgs.gettext}/bin/envsubst < "\$TEMPLATE_PATH" > "\$CONFIG_PATH"
            exec ${pkgs.caddy}/bin/caddy run --config "\$CONFIG_PATH"
            EOF
            chmod +x $out/bin/start-proxy
          '';
        };

        devShells.default = pkgs.mkShell {
          packages = [ pkgs.caddy pkgs.gettext ];
          shellHook = ''
            echo "Caddy version: $(caddy --version)"
            echo "Run './start.sh' to start the proxy in dev mode."
          '';
        };
      });
}
