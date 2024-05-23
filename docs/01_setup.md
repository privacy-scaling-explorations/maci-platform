# Setup

Follow these instructions to deploy your own instance of MACI-RPGF.

## 1. Fork Repo

[Fork MACI-RPGF](https://github.com/privacy-scaling-explorations/maci-rpgf/tree/main)

1. Click to view the `.env.example` file in your newly created repo
2. Copy its contents and paste into a text editor

## 2. Configuration

The `.env.example` file contains instructions for most of these steps.

At the very minimum you need to configure a postgres database, nextauth, admin address, and the EAS Schema under App Configuration.

#### Database

https://vercel.com/dashboard/stores?type=postgres

1. Press Create Database button
2. Select Postgres, press continue, and give it a name and region
3. Press `.env.local` tab, Copy Snippet and paste into text editor

<div>
    <img width="45%" src="./images/create_postgres.png" />
    <img width="45%" src="./images/create_postgres_details.png" />
</div>

#### Auth

1. Generate a secret (`openssl rand -base64 32`)
2. Configure `NEXTAUTH_URL` (this should only be necessary on localhost or for production domains)

#### Network

The default configuration is Optimism Sepolia for development and Optimism for production.

You can find supported networks on the EAS documentation website: https://docs.attest.sh/docs/quick--start/contracts

#### App

Configure how many votes each voter receives and how many votes each project can receive.
You can also find configurations for when voting starts and ends as well as the registration and review period.

Here, you can also configure who your admins are. These are the users who will approve applications and voters.

To create your own round you need to do a few things:

- Update `NEXT_PUBLIC_ADMIN_ADDRESS` a wallet address that approve the applications and voters (badgeholders)
- Set `NEXT_PUBLIC_ROUND_ID` to a unique identifier that will group the applications and lists you want to list
- Set `NEXT_PUBLIC_MACI_START_BLOCK` - block where your maci contract is deployed (optional)
- Set `NEXT_PUBLIC_TALLY_URL` - your endpoint for vote results, where you host `tally-{pollId}.json` files.

#### EAS

If you are running on a different network than Optimism you need to update the contract addresses for EAS. These addresses are used whenever an attestation is created.

You can also configure your own schemas here if you wish to, or deploy the EAS contracts to a network that doesn't have them.

## 3. Download .zkey files

Download ceremony artifacts with:

```bash
pnpm download-zkeys
```

or you could download your own zkey files with:

```bash
pnpm download-zkeys -i <zkey_url>
```

Then, you could extract vkeys from the zkey files with:

```bash
pnpm extract-vkeys
```

This command would extract vkeys and put them with a default file name and put the file in the `/public` folder.

You could specify output file name with:

```bash
pnpm extract-vkeys -o <vkey_file_name>
```

It would be easier to run the following command that combines the above two commands:

```bash
pnpm prepare
```

After this step, you should put the vkey file path in the app configuration, which means you should update the `NEXT_PUBLIC_VKEY_FILE_PATH` in the `.env` file. The default path is `vkeys.json`.

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

Once the voting time has ended, as a coordinator, first you need to merge signups and messages (votes). Head to MACI contracts repository and run the merge command with the deployed poll:

```bash
cd contracts  && \
pnpm merge:[network] --poll [poll-id]
```

> [!IMPORTANT]
> For version 1.2.3 you need to deploy a new MACI contract for a new round.

Then the coordinator generates proofs for the message processing, and tally calculations. This allows to publish the poll results on-chain and then everyone can verify the results when the poll is over:

```bash
pnpm run prove:[network] --poll [poll-id] \
    --coordinator-private-key [coordinator-maci-private-key] \
    --tally-file ../cli/tally.json \
    --output-dir ../cli/proofs/ \
```

Once you have the tally.json file you can rename it (tally-{pollId}.json), upload it and add it as an enviroment variable `NEXT_PUBLIC_TALLY_URL` to show the results.

## Additional configuration

### Configure theme and metadata

Edit `tailwind.config.ts` and `src/config.ts`

_You can edit files directly in GitHub by navigating to a file and clicking the Pen icon to the right._

### Creating EAS Schemas and Attestations

You can create your own schemas by running this script.

```sh
WALLET_PRIVATEKEY="0x..." npm run eas:registerSchemas
```
