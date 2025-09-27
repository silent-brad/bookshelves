{
  description = "Angular frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        node = pkgs.nodejs_20;
        angular_cli = pkgs.nodePackages."@angular/cli";
        tooling = [ node angular_cli ];
      in {
        packages.default = pkgs.buildNpmPackage {
          pname = "frontend";
          version = "1.0.0";
          src = ./.;

          npmDepsHash = "sha256-9ArGucNJ9RXNeGWJejlAyJoyzVOh0/GcvAHmims1sAE=";

          npmInstallFlags = [ "--frozen-lockfile" "--offline" ];

          nativeBuildInputs = tooling;
          preBuild = ''
            export NODE_PATH="$PWD/node_modules:$NODE_PATH"
          '';

          npmBuildScript = "build";
          doCheck = true;
          dontNpmInstall = false;

          installPhase = ''
            runHook preInstall

            cp -r dist/ $out/

            runHook postInstall
          '';

          buildPhase = ''
            #ng analytics disable
            export NG_CLI_ANALYTICS=false
            ng build --configuration production
          '';

          npmTestScript = "echo No tests yet"; # "ng test"
        };

        devShells.default = pkgs.mkShell {
          packages = tooling ++ [ pkgs.eslint ];

          shellHook = ''
            echo "Node $(${node}/bin/node -v)"
            echo "Run 'npm install' once, then 'ng serve' for hot-reload."
          '';
        };

        checks.default = self.packages.${system}.default;
      });
}
