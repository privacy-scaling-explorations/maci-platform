# Setup

Follow these instructions to deploy your own instance of MACI-PLATFORM.

## Video Tutorial

A complete installation tutorial can be seen here (version 1.2.4, has some outdated steps):

[![Watch the Video](https://img.youtube.com/vi/86VBbO1E4Vk/0.jpg)](https://www.youtube.com/watch?v=86VBbO1E4Vk)

## 1. Fork Repo

[Fork MACI-PLATFORM](https://github.com/privacy-scaling-explorations/maci-platform/tree/main)

1. Clone the forked repo and cd into the project folder `cd maci-platform`
2. Copy `packages/interface/.env.example` into a new `.env` file with command:

```bash
cp packages/interface/.env.example packages/interface/.env
```

## 2. Deploy MACI

As a coordinator you need to deploy a MACI instance and poll.

### Install MACI

> [!IMPORTANT]
> If you get an error saying that pnpm version is incompatible install the compatible version with `pnpm i -g pnpm@<target_version>` and replace <target_version> with the version thrown in the error.

You can read about the [MACI requirements here](https://maci.pse.dev/docs/quick-start/installation). To install MACI run the following commands:

```bash
git clone https://github.com/privacy-scaling-explorations/maci.git && \
cd maci && \
git checkout v2.1.0 && \
pnpm i && \
pnpm run build
```

> [!IMPORTANT]
> The circuits of MACI version ^2.0.0 are audited, and the zKeys have undergone a trusted setup ceremony.

### Download .zkey files

Come back to the maci-plaform repo and download the test keys for testnet only:

```bash
pnpm run download-zkeys:test
```

or the ceremony artifacts for production:

```bash
pnpm run download-zkeys:prod
```

Note the locations of the zkey files as the CLI requires them as command-line flags. Make sure they are saved in the cli/ folder.

### Set .env Files

Head to the `packages/contracts` folder and copy the `.env.example` file. Make sure to include a mnemonic and RPC url. Remember to use your desired network env variables.

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

> [!IMPORTANT]
> Make sure that you use the production zkeys (copy the correct generated coordinatorPubkey), set the `pollDuration` with the correct time in **seconds** and set `useQuadraticVoting` to false.

### Deploy MACI Contracts

There are already some deployed contracts that could be reused. Copy the `default-deployed-contracts.json` file if you need them to avoid deploying redundant contracts and save gas fees.

```bash
cp default-deployed-contracts.json deployed-contracts.json
```

We highly recommend that if you already copied the `default-deployed-contracts.json` file to `deployed-contracts.json` file, run the following command to save your gas:

```bash
pnpm deploy:NETWORK --incremental
```

Specify `NETWORK` with one of the available networks on the `package.json` scripts section.

Of course, you can also deploy the contracts without the `incremental` flag:

> [!WARNING]
> If you decide to use this approach, make sure you have enough ETH, as deploying the full contracts suite will have a high transaction fee.

```bash
pnpm deploy:NETWORK
```

Deploy your first Poll (you can specify the network as well by appending :network to the command, e.g. pnpm deploy-poll:sepolia - please refer to the available networks on the `package.json` scripts section).

```sh
pnpm deploy-poll:NETWORK
```

See [MACI docs](https://maci.pse.dev/docs/quick-start/deployment#deployment-using-maci-contracts-hardhat-tasks) for more information.

## 3. Configuration

The `.env.example` file in the `packages/interface/` folder contains instructions for most of these steps.

At the very minimum you need to configure a **subgraph**, **admin address**, **MACI address**, the **EAS Schema** and the **application registration periods** under App Configuration. You can do this following these next steps.

### Subgraph

Go to the subgraph folder.

```bash
cd packages/subgraph
```

1. Change the network name inside the `network.json` file in the `config` folder, using one of the CLI names supported for subgraph network [https://thegraph.com/docs/en/developing/supported-networks/](https://thegraph.com/docs/en/developing/supported-networks/).

2. Create a subgraph in [the graph studio](https://thegraph.com/studio/). Note down the name of the subgraph.

3. Add network, maci contract address and maci contract deployed block.

```json
{
  "network": "optimism-sepolia",
  "maciContractAddress": "0xD18Ca45b6cC1f409380731C40551BD66932046c3",
  "maciContractStartBlock": 11052407
}
```

4. If you have not yet installed the graph CLI in your computer globally do so by running `pnpm i -g @graphprotocol/graph-cli`

5. Run `pnpm run build`. You can use env variables `NETWORK` and `VERSION` to switch config files.
   - Create an `.env` file, and run the following command in the console `export $(xargs < .env)`
6. Copy the auth command from the Subgraph Studio graph details in section "Auth and Deploy", paste it into the terminal and execute it. I should look something like this `graph auth --studio {key}`.
7. Change `package.json` deploy script to graph deploy --node https://api.studio.thegraph.com/deploy/<name> where <name> is the name that you gave to the subgraph you created.
8. Run `pnpm run deploy` to deploy the subgraph.
9. Note down the url of the deployed subgraph API endpoint.

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
