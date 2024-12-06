# Setup

Follow these instructions to deploy your own instance of MACI-PLATFORM.

## Requirements

You need the following to use MACI-PLATFORM:

- Node.js: use a JS toolchain manager like [`nvm`](https://github.com/nvm-sh/nvm) or [`volta`](https://volta.sh/) to install Node.js. We recommend using Node 20 or above.
- [pnpm](https://pnpm.io/installation): Fast, disk space efficient package manager.

> [!IMPORTANT]
> If you encounter an error saying that the pnpm version is incompatible, install the compatible version by running `pnpm i -g pnpm@<target_version>`, replacing <target_version> with the version specified in the error.

## Fork the Repo

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

## Deploy MACI Contracts

As a coordinator you need to deploy a MACI instance and poll. Before deploying the contracts you need to:

1. Generate the MACI Keys.
2. Download the zero knowledge artifacts.
3. Configure the round metadata.
4. Set the contract .envs
5. Configure the deployment file.

### Generate MACI Keys

In order to run MACI polls, a coordinator is required to publish their MACI public key. You will need to generate a MACI keypair, and treat the private key just as your Ethereum private keys. Please store them in a safe place as you won't be able to finish a round if you lose access, or if compromised a bad actor could decrypt the vote and publish them online. You can generate a new key pair by running the following commands:

```bash
cd packages/coordinator
pnpm generate-maci-keypair
```

### Download the zero knowledge artifacts

Download ceremony artifacts for production:

```bash
pnpm download-zkeys:prod
```

or the test keys for testnet only:

```bash
pnpm download-zkeys:test
```

The files are stored on the zkeys folder. Note the locations of the .zkey files cause you will need it when deploying contracts.

### Set the coordinator .env files

Copy the `.env.example` file. For this version only make sure to include the `BLOB_READ_WRITE_TOKEN` variable from vercel to storage the metadata.

```bash
cp .env.example .env
```

### Generate the round metadata

For the frontend to know what metadata has each Poll we need to generate and upload a JSON file that then is stored on-chain. The best way to do it is using the following command:

```bash
pnpm upload-round-metadata
```

Here you need to set:

1. Name of the round
2. Brief description of the round
3. Start time of the round, and how long will last the application and voting periods.

This command will upload the JSON file to your configured vercel account and will print a link which you need to add in the Set the configuration file section.

> [!IMPORTANT]
> Current version of MACI-PLATFORM supports multiple Polls, for each Poll you should configure new round metadata.

### Set the contract .env files

Head back to the `packages/contracts` folder and copy the `.env.example` file.

```bash
cd ../../packages/contracts/
cp .env.example .env
```

Make sure to include a mnemonic and RPC url. Make sure to specify the env variable for your desired network.

```
MNEMONIC="your_ethereum_secret_key"
OP_SEPOLIA_RPC_URL="the_rpc_url"
ETHERSCAN_API_KEY="etherscan api key"
```

### Set the configuration file

Copy the config example and update the fields as necessary:

```bash
cp deploy-config-example.json deploy-config.json
```

There are already some deployed contracts that could be reused, copy the `default-deployed-contracts.json` file if you need them to avoid deploying redundant contracts and save your gas fee.

```bash
cp default-deployed-contracts.json deployed-contracts.json
```

> [!IMPORTANT]
> Ensure that you replace the `coordinatorPubKey` generated in the [previous step](#Generate-MACI-Keys), set the `pollDuration` to the correct time in **seconds** and add the poll metadata in the metadataUrl in the SimpleRegistry.

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

Now you need to init the deployed Poll (starts with 0).

```sh
pnpm initPoll:NETWORK --poll [poll-id]
```

## 3. Configuration

The `.env.example` file in the `packages/interface/` folder contains instructions for most of these steps.

At the very minimum you need to configure a **subgraph**, **admin address**, **MACI address**, the **EAS Schema** and the **application registration periods** under App Configuration.

### Subgraph

Head to the subgraph folder.

```bash
cd ../../packages/subgraph/
```

1. Make sure you have `{network}.json` file in `config` folder, where network is a CLI name supported for subgraph network [https://thegraph.com/docs/en/developing/supported-networks/](https://thegraph.com/docs/en/developing/supported-networks/).

2. Create a subgraph in [the graph studio](https://thegraph.com/studio/). Note down the name of the subgraph

3. Add network, maci contract address, registry manager address, maci contract deployed block and registry manager contract deployed block.

```json
{
  "network": "optimism-sepolia",
  "maciContractAddress": "0xca941B064D28276D7f125324ad2a41ec4c7F784e",
  "maciContractStartBlock": 19755066,
  "registryManagerContractAddress": "0xBc014791f00621AD08733043F788AB4ecAe3BAAd",
  "registryManagerContractStartBlock": 19755080
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
cd packages/contracts
pnpm merge:[network] --poll [poll-id]
```

Then the coordinator generates proofs for the message processing, and tally calculations. This allows to publish the poll results on-chain and then everyone can verify the results when the poll is over:

```bash
pnpm run prove:[network] --poll [poll-id] \
    --coordinator-private-key [coordinator-maci-private-key] \
    --tally-file ../results/tally.json \
    --output-dir ../results/proofs/ \
    --start-block [block-number]
    --blocks-per-batch [number-of-blocks]
```

> [!IMPORTANT]
> You can reduce the time of the proving by including more blocks per batch, you can try with 500.

Now it's time to submit the poll results on-chain so that everyone can verify the results:

```bash
pnpm submitOnChain:[network] --poll [poll-id] \
    --output-dir proofs/ \
    --tally-file proofs/tally.json
```

## Additional configuration

### Configure theme and metadata

Edit `tailwind.config.ts` and `src/config.ts`

_You can edit files directly in GitHub by navigating to a file and clicking the Pen icon to the right._

### Creating EAS Schemas and Attestations

You can create your own schemas by running this script.

```sh
WALLET_PRIVATEKEY="0x..." npm run eas:registerSchemas
```
