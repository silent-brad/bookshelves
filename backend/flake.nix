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
          '';
          installPhase = ''
            mkdir -p $out/repository
            cp -r $TMPDIR/.m2/repository/* $out/repository/
            find $out/repository -name '_remote.repositories' -delete
            find $out/repository -name 'maven-metadata.xml' -exec sed -i '/<lastUpdated>/d' {} \;
            find $out/repository -type d -exec chmod 755 {} \;
            find $out/repository -type f -exec chmod 644 {} \;
          '';
          outputHashMode = "recursive";
          outputHashAlgo = "sha256";
          outputHash = "sha256-Yi6mLwYHWqx/DKuGHO9k05e+p6xGG2uXnblpcm8oGEg=";
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
            #chmod -R 755 $TMPDIR/.m2/repository
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

            cat > $out/bin/init_db <<EOF
            #!/usr/bin/env ${pkgs.bash}
            echo "Creating DB"
            exec ${java}/bin/java $out/bin/app \
              --add-flags "-jar $out/share/app/app.jar --spring.datasource.url=jdbc:sqlite:\$(pwd)/bookshelves.db" --spring.jpa.hibernate.ddl-auto=create-drop
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
