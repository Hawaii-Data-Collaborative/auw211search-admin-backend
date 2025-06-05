# AUW 211 Search Admin Backend

This is the admin site backend repo for https://search.auw211.org.

## Development

### Setup

Clone the repo, run `npm i`, run `npx prisma generate`.

`cp .env.example .env` then edit accordingly.

### Running

Open a terminal, run `npm run dev` to start the server.

### Deploy

Run `./deploy.sh` to copy files to the production machine then execute commands to update and restart the
production server.

NOTE: `./deploy.sh` assumes you have an entry called `auw1` in your `~/.ssh/config` file.
