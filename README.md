# bookshelves

> _A Book Sharing App_

To start the app, run `./start`. To stop the app run `./stop`.

To run the app locally, run `nix develop`, `mvn clean package && java -jar target/bookshelves-0.0.1-SNAPSHOT.jar` (in backend) and `ng serve` (in frontend).

To deploy the app, run `nix build .#dockerImage` and `docker load < result`.

> NOTE: Make sure you change the `IP` in the `.env` file for PROD.
