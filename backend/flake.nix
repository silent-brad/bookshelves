{
  description = "Java/Spring Boot/SQLite backend";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        java = pkgs.jdk17;
        maven = pkgs.maven;
        tooling = [ java maven pkgs.sqlite pkgs.makeWrapper ];
      in {
        packages.default = pkgs.maven.buildMavenPackage {
          pname = "backend";
          version = "0.0.1";
          src = ./.;

          mvnHash = "sha256-u6X+hrbgB0NQePCzm0O3on1D5rtipAu0XbWqNHD5hM4=";

          nativeBuildInputs = tooling;
          buildOffline = true;

          installPhase = ''
            mkdir -p $out/bin $out/share/app
            install -Dm644 ./target/bookshelves-0.0.1-SNAPSHOT.jar $out/share/app/app.jar

            cat > $out/bin/init_db <<EOF
            #!/usr/bin/env ${pkgs.bash}
            echo "Creating DB"
            java -jar $out/share/app/app.jar --spring.datasource.url=jdbc:sqlite:\$(pwd)/bookshelves.db --spring.jpa.hibernate.ddl-auto=create-drop
            EOF
            chmod +x $out/bin/init_db

            makeWrapper ${java}/bin/java $out/bin/app \
              --add-flags "-jar $out/share/app/app.jar --spring.datasource.url=jdbc:sqlite:\$(pwd)/bookshelves.db"
          '';
        };

        devShells.default = pkgs.mkShell {
          packages = tooling;

          shellHook = ''
            echo "$(${java}/bin/java --version)"
          '';
        };
      });
}
