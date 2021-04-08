# Satellite Monitor
This application monitors the health of our satellite.

## Services

### Data Storage - Mongo
We are storing altitudes in mongo for the last 5 minutes.  Altitudes automatically expire after 5 minutes.
Although writing single rows every 10 seconds, data volume would not become an unhandleable issue for at least tens of years, expiring rows will allow us to use cheaper servers.  If we decide we need to keep rows for longer for auditing purposes, the expiration time could be scaled up to years.  We're also storing rolling averages that expire after 5 minutes.

### Poller
The poller, ensures indexes exist on startup.  (This would not happen in production).  It queries `nestio.space/api/satellite/data` every 10 seconds, and upserts new values into the database.  It also adds a rolling average of the last 5 minutes to the database.

### Server
The server is built on `node-rest-server`.

## Running Locally
1. Ensure you have [docker](https://www.docker.com/) installed and running
2. Ensure port `8000` and `27017` are not in use on your machine
3. Run `docker-compose up` from the project directory (or `docker-compose up --detach` for quieter console output)
4. Visit [the service](http://localhost:8000/stats)

## Running Testing
From the project directory:
1. `npm i`
2. `npm t`


## Productionization
The server and poller would be run in Kubernetes.  There would be multiple servers, but only one poller.  Kubernetes would ensure there was at least one poller running.  Mongo would be deployed to as a group of small EC2s that could elect a new leader in case of failure.  There will initially be 3 of them.

### Future considerations
- Depending on how many api calls the service is handling, there is no reason why we can't precalculate our endpoint responses as altitudes are written and just return the precalculated responses from the database.
- As of now, we're running our service in dev mode.  We should use `tsc` to compile into javascript and run those files in production.
- I'm aware I'm not properly managing mongo connections.  I'd need to go back and fix this to get rid of the warnings by wrapping mongo calls as seen in [the docs](https://docs.mongodb.com/drivers/node/fundamentals/connection/).
