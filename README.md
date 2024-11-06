# MACI Platform

MACI Platform is a complete solution for running voting and funding rounds using [MACI](https://maci.pse.dev).

It is comprised of two components:

- Coordinator Service - the complete automation of MACI operations
- Interface - a web app for managing and voting on MACI polls

### MACI-Platform docs

- [Setup & Deployment](./docs/01_setup.md)
- [Adding Projects & Approving](./docs/02_adding_projects.md)
- [Creating Badgeholders/Voters](./docs/03_creating_badgeholders.md)
- [Voting](./docs/04_voting.md)
- [Results](./docs/05_results.md)
- [Troubleshooting of MACI](./docs/06_maci_troubleshooting.md)

### MACI docs

- [Documentation](https://maci.pse.dev/docs/introduction)

## Development

To run locally follow these instructions:

```sh
git clone https://github.com/privacy-scaling-explorations/maci-platform

pnpm install

cp packages/interface/.env.example packages/interface/.env # and update .env variables

pnpm build

```

At the very minimum you need to configure the subgraph url, admin address, maci address and the voting periods. For more details head to [Setup & Deployment](./docs/01_setup.md). Once you have set everything run:

```sh
pnpm run dev:interface

open localhost:3000
```

## Documentation

MACI-Platform uses EAS as backbone to run Retroactive Public Goods Funding to reward contributors ([As used by the Optimism Collective](https://community.optimism.io/citizens-house/how-retro-funding-works)) while adding a privacy layer to reduce bribery and collusion using MACI.

## Video Tutorial

A complete installation tutorial can be seen here:

[![Watch the Video](https://img.youtube.com/vi/86VBbO1E4Vk/0.jpg)](https://www.youtube.com/watch?v=86VBbO1E4Vk)

## Credits

The interface started as a fork of [easy-rpgf](https://github.com/gitcoinco/easy-retro-pgf), but now has gone a completely different direction and thus we decided to detach the fork to clarify the new direction of the project, which is not focusing anymore on RPGF only, but other types of voting and funding.

We are very thankful to the developers and all contributors of the [easy-rpgf](https://github.com/gitcoinco/easy-retro-pgf) project, and we hope to continue collaborating and wish to see their project succeed and help more communities/projects get funded.
