{
  description =
    "Book sharing web app with Spring Boot, Angular, SQLite, and Nix";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    backend.url = "path:./backend";
    frontend.url = "path:./frontend";
    proxy.url = "path:./proxy"; # New: Integrate proxy flake
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, backend, frontend, proxy, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "bookshelves";
          version = "0.0.1";

          unpackPhase = "true";

          installPhase = ''
            mkdir -p $out/bin $out/static $out/data

            # Copy backend
            cp -r ${backend.packages.${system}.default}/bin/. $out/bin/
            cp -r ${backend.packages.${system}.default}/data/. $out/data/

            # Copy frontend build
            cp -r ${frontend.packages.${system}.default}/. $out/static/

            # Copy proxy bin and config
            cp -r ${proxy.packages.${system}.default}/bin/. $out/bin/
            cp -r ${proxy.packages.${system}.default}/data/. $out/data/
          '';
        };

        devShells.default = pkgs.mkShell {
          inputsFrom = [
            backend.devShells.${system}.default
            frontend.devShells.${system}.default
            proxy.devShells.${system}.default # New: Include proxy dev tools
          ];
          buildInputs = with pkgs; [ docker doctl ];
        };

        checks = pkgs.lib.mergeAttrs backend.checks.${system}
          (pkgs.lib.mergeAttrs frontend.checks.${system}
            (proxy.checks.${system} or { })); # New: Include proxy checks if any
      });
}
