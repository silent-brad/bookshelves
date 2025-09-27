{ pkgs ? import <nixpkgs> { } }:

# Nix shell for local testing

pkgs.mkShell {
  buildInputs = with pkgs; [
    # For backend
    jdk17
    maven
    sqlite

    # For frontend
    nodejs_20
    nodePackages."@angular/cli"
    eslint

    # For proxy
    caddy
    gettext
  ];
}
