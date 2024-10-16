# Setup

Follow these instructions to deploy your own instance of MACI-PLATFORM.

## Video Tutorials

Complete installation tutorials can be seen here:

- [Deploying Contracts and Subgraph](https://www.youtube.com/watch?v=-QA0VB9EUMk)
- [Frontend Deployment](https://www.youtube.com/watch?v=q0yS8RfwDcw)
- [Finalizing a MACI Round](https://www.youtube.com/watch?v=nlS3hOC0ljw)

## 1. Fork Repo

[Fork MACI-PLATFORM](https://github.com/privacy-scaling-explorations/maci-platform/tree/main)

1. Clone the forked repo and navigate into the project folder `cd maci-platform`

```bash
git clone [forked github repository]
cd maci-platform
```

2. Copy `packages/interface/.env.example` into a new `.env` file using the following command:

```bash
cp packages/interface/.env.example packages/interface/.env
```

## 2. Deploy MACI

As a coordinator you need to deploy a MACI instance and poll.

### Install MACI

> [!IMPORTANT]
> If you encounter an error saying that the pnpm version is incompatible, install the compatible version by running `pnpm i -g pnpm@<target_version>`, replacing <target_version> with the version specified in the error.

You can read about the [MACI requirements here](https://maci.pse.dev/docs/quick-start/installation). To install MACI run the following commands:

```bash
git clone https://github.com/privacy-scaling-explorations/maci.git && \
cd maci && \
git checkout v2.4.0 && \
pnpm i && \
pnpm run build
```

> [!IMPORTANT]
> The circuits of MACI version ^2.0.0 are audited, and the zKeys have undergone a trusted setup ceremony.

### Download .zkey files

Download ceremony artifacts for production:

```bash
pnpm download:ceremony-zkeys
```

or the test keys for testnet only:

```bash
pnpm download:test-zkeys
```

Note the locations of the zkey files as the CLI requires them as command-line flags.

### Set .env Files

Head to the `packages/contracts` folder and copy the `.env.example` file. Make sure to include a mnemonic and RPC url. Make sure to specify the env variable for your desired network.

```
MNEMONIC="your_ethereum_secret_key"
ETH_PROVIDER="the_eth_provider_url"
ETHERSCAN_API_KEY="etherscan api key"
```

### Generate MACI Keys

Generate a new key pair and save it in a secure place.

```bash
cd packages/cli && \
node build/ts/index.js genMaciKeyPair
```

### Set the configuration file

Head back to the contracts folder.

```bash
cd ../contracts
```

Copy the config example and update the fields as necessary:

```bash
cp deploy-config-example.json deploy-config.json
```

There are already some deployed contracts that could be reused, copy the `default-deployed-contracts.json` file if you need them to avoid deploying redundant contracts and save your gas fee.

```bash
cp default-deployed-contracts.json deployed-contracts.json
```

> [!IMPORTANT]
> Ensure that you replace the `coordinatorPubKey` generated in the [previous step](#Generate-MACI-Keys) and set the `pollDuration` to the correct time in **seconds**.

### Deploy MACI Contracts

Run `pnpm deploy` to deploy the contracts (you can specify the network by appending `:network` to the command, e.g. pnpm deploy:sepolia - please refer to the available networks on the package.json scripts section)
We highly recommend that if you already copy the `default-deployed-contracts.json` file to `deployed-contracts.json` file, run the following command to save your gas:

```bash
pnpm deploy:NETWORK --incremental
```

Of course you could run without the `incremental` flag to deploy everything by yourself:

```bash
pnpm deploy:NETWORK
```

To deploy your first Poll (you need to specify the same network as the MACI contracts by appending :network to the command, e.g. pnpm deploy-poll:sepolia - please refer to the available networks on the `package.json` scripts section).

```sh
pnpm deploy-poll:NETWORK
```

See [MACI docs](https://maci.pse.dev/docs/quick-start/deployment#deployment-using-maci-contracts-hardhat-tasks) for more information.

## 3. Configuration

The `.env.example` file in the `packages/interface/` folder contains instructions for most of these steps.

At the very minimum you need to configure a **subgraph**, **admin address**, **MACI address**, the **EAS Schema** and the **application registration periods** under App Configuration.

### Subgraph

In the **MACI** repo and head to the subgraph folder.

```bash
cd apps/subgraph
```

1. Make sure you have `{network}.json` file in `config` folder, where network is a CLI name supported for subgraph network [https://thegraph.com/docs/en/developing/supported-networks/](https://thegraph.com/docs/en/developing/supported-networks/).

2. Create a subgraph in [the graph studio](https://thegraph.com/studio/). Note down the name of the subgraph

3. Add network, maci contract address and maci contract deployed block.

```json
{
  "network": "optimism-sepolia",
  "maciContractAddress": "0xD18Ca45b6cC1f409380731C40551BD66932046c3",
  "maciContractStartBlock": 11052407
}
```

4. If you haven't installed the graph CLI in your computer globally yet, do so by running `pnpm i -g @graphprotocol/graph-cli`
5. Run `pnpm run build`. You can use env variables `NETWORK` and `VERSION` to switch config files.
   - Create an `.env` file, and run the following command in the console `export $(xargs < .env)`
6. Copy the authenticate command from the 'Auth and Deploy' section in the Subgraph Studio graph details, paste it into the terminal, and execute it. The command should look like this: `graph auth --studio {key}`.
7. Change `package.json` deploy script to `graph deploy --node https://api.studio.thegraph.com/deploy/ <name>` where <name> is the name that you gave to the subgraph you created.
8. Run `pnpm run deploy` to deploy the subgraph.
9. Note down the url of the deployed subgraph API endpoint.

> [!IMPORTANT]
> If you always use the latest version the URL will be `https://api.studio.thegraph.com/query/<USER_ID>/<YOUR_SUBGRAPH_NAME>/version/latest`.

#### Network

The default configuration is Optimism Sepolia for development and Optimism for production.

You can find supported networks on the EAS documentation website: https://docs.attest.sh/docs/quick--start/contracts

#### App

Configure the round timelines such as starts and end dates for the application registration period.

Here, you can also configure the admin address who will approve applications and voters.

To create your own round you need to do the following:

- Update `NEXT_PUBLIC_ADMIN_ADDRESS` a wallet address that approves the applications and voters (badgeholders)
- Set `NEXT_PUBLIC_ROUND_ID` to a unique identifier that will group the applications you want to list
- Set `NEXT_PUBLIC_MACI_ADDRESS` - your deployed maci contract
- Set `NEXT_PUBLIC_MACI_SUBGRAPH_URL` - maci subgraph url. You can set it up using [maci-subgraph](https://github.com/privacy-scaling-explorations/maci/tree/dev/subgraph).
- Set `NEXT_PUBLIC_MACI_START_BLOCK` - block where your maci contract is deployed - optional but very much recommended (as it's a fallback to subgraph not setup/working)
- Set `NEXT_PUBLIC_TALLY_URL` - your endpoint for vote results, where you host `tally-{pollId}.json` files.

#### EAS

If you are running on a different network than Optimism Sepolia, just change the `NEXT_PUBLIC_CHAIN_NAME` to your network. Please head to `src/config.ts` to see which networks are available in the config file. The EAS addresses are used to create attestations for either voters or projects.

If using EAS, it is required to create a schema on the network you choose to use. Once it's created, you can add the IDs to `NEXT_PUBLIC_APPROVAL_SCHEMA` and `NEXT_PUBLIC_METADATA_SCHEMA`. Please note that the schema IDs in the `.env.example` file work on Optimism Sepolia only.

You can also configure your own schemas here if you wish to, or deploy the EAS contracts to a network that doesn't have them.

## 4. Deploy Frontend

https://vercel.com/new

1. Import the repo you created/forked
2. Open the Environment Variables panel
3. Select the first field and paste your variables from your text editor
4. Deploy!

<div>
  <img width="45%" src="./images/vercel_new.png" />
  <img width="45%" src="./images/vercel_configure.png" />
</div>

## Poll finalization

Once the voting time has ended, as a coordinator, first you need to merge signups and messages (votes). Head to **MACI** repository and run the merge command with the deployed poll:

```bash
cd packages/contracts  && \
pnpm merge:[network] --poll [poll-id]
```

> [!IMPORTANT]
> For version 1.2 you need to deploy a new MACI contract for a new round.

Then the coordinator generates proofs for the message processing, and tally calculations. This allows to publish the poll results on-chain and then everyone can verify the results when the poll is over:

```bash
pnpm run prove:[network] --poll [poll-id] \
    --coordinator-private-key [coordinator-maci-private-key] \
    --tally-file ../cli/tally.json \
    --output-dir ../cli/proofs/ \
    --start-block 12946802
```

> [!IMPORTANT]
> We suggest including the --start-block flag, proving requires fetching all events from the smart contracts and by default starts from block zero, this would take a lot of time and is error-prone due to RPC provider limitations.

Once you have the `tally.json` file you can rename it (`tally-{pollId}.json`), upload it and add it as an environment variable `NEXT_PUBLIC_TALLY_URL` to show the results.

## Additional configuration

### Configure theme and metadata

Edit `tailwind.config.ts` and `src/config.ts`

_You can edit files directly in GitHub by navigating to a file and clicking the Pen icon to the right._

### Creating EAS Schemas and Attestations

You can create your own schemas by running this script.

```sh
WALLET_PRIVATEKEY="0x..." npm run eas:registerSchemas
```
