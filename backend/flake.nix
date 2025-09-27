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

        # Pre-fetch Maven dependencies for offline build
        springBootVersion = "3.3.4";
        mvnDeps = pkgs.stdenv.mkDerivation {
          name = "maven-deps";
          buildInputs = [ maven java ];
          src = ./.;
          buildPhase = ''
            export JAVA_HOME=${java}
            mkdir -p $TMPDIR/.m2/repository
            chmod -R 755 $TMPDIR/.m2/repository
            export MAVEN_OPTS="-Dmaven.repo.local=$TMPDIR/.m2/repository"
            mvn dependency:go-offline -B
            mvn package -B
          '';
          installPhase = ''
            mkdir -p $out/repository
            cp -r $TMPDIR/.m2/repository/* $out/repository/
          '';
          outputHashMode = "recursive";
          outputHashAlgo = "sha256";
          outputHash = "sha256-Z9iPv7A5tLYLSsiLoCrzqYxtmr6Z8Cz0D98GtxAzQFQ=";
        };
      in {
        packages.default = pkgs.maven.buildMavenPackage {
          pname = "backend";
          version = "0.0.1";
          src = ./.;

          mvnHash = "sha256-u6X+hrbgB0NQePCzm0O3on1D5rtipAu0XbWqNHD5hM4=";

          nativeBuildInputs = tooling;
          buildOffline = true;
          preBuild = ''
            export JAVA_HOME=${java}
            mkdir -p $TMPDIR/.m2/repository
            chmod -R 755 $TMPDIR/.m2/repository
            export MAVEN_OPTS="-Dmaven.repo.local=$TMPDIR/.m2/repository"
            cp -r ${mvnDeps}/repository/* $TMPDIR/.m2/repository/
            chmod -R 755 $TMPDIR/.m2/repository
          '';

          checkPhase = ''
            mvn test
          '';

          installPhase = ''
            mvn package
            mkdir -p $out/bin $out/share/app
            install -Dm644 ./target/bookshelves-0.0.1-SNAPSHOT.jar $out/share/app/app.jar
            makeWrapper ${java}/bin/java $out/bin/app \
              --add-flags "-jar $out/share/app/app.jar"
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
