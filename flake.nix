{
  description = "Book sharing web app with Spring Boot, Angular, and Nix";

  inputs = { nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable"; };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          jdk17 # For Spring Boot
          maven # Build tool for Java
          nodejs_20 # For Angular
          #nodePackages.npm
          nodePackages."@angular/cli"
          sqlite
          flyctl
        ];
        shellHook = ''
          export JAVA_HOME=${pkgs.jdk17}
        '';
      };
    };
}
