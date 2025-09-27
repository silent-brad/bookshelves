{
  description =
    "Book sharing web app with Spring Boot, Angular, SQLite, and Nix";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    backend.url = "path:./backend";
    frontend.url = "path:./frontend";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, backend, frontend, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "bookshelves";
          version = "0.0.1";

          unpackPhase = "true";

          installPhase = ''
            mkdir -p $out/bin $out/static

            cp -r ${backend.packages.${system}.default}/* $out/bin/

            # Copy frontend build
            cp -r ${frontend.packages.${system}.default}/* $out/static/
          '';
        };

        devShells.default = pkgs.mkShell {
          inputsFrom = [
            backend.devShells.${system}.default
            frontend.devShells.${system}.default
          ];
          buildInputs = with pkgs; [
            caddy
            docker
            doctl
          ]; # Uncommented and moved here
        };

        checks = pkgs.lib.mergeAttrs backend.checks.${system}
          frontend.checks.${system};
      });
}
