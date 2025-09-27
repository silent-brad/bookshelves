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

          buildInputs = [
            pkgs.caddy
            pkgs.gettext
          ]; # gettext provides envsubst for template substitution

          installPhase = ''
            mkdir -p $out/bin $out/config $out/data
            # Pre-process the Caddyfile.template with default values or placeholders
            sed -e "s|\$PROXY_PORT|8080|g" -e "s|\$SERVER_PORT|8000|g" -e "s|\$FRONTEND_PATH|$(dirname \"\$0\")/../static|g" Caddyfile.template > $out/data/Caddyfile
            # Create a wrapper script to run caddy with the correct config path
            cat > $out/bin/start-proxy <<EOF
            #!/bin/sh
            echo "Starting reverse proxy"
            CONFIG_PATH="\$(dirname "\$0")/../data/Caddyfile"
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
