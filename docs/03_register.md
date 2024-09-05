# Different gating strategy

You can specify the desired [gating strategy](https://maci.pse.dev/docs/developers-references/smart-contracts/Gatekeepers) in the **deploy-config.json** file, see **01_setup.md** and **maci** repository for more information. Using different gating strategies will result in different authentication methods.

# Free for all

Everyone can register to the MACI contract without any authentication.

# EAS

Everyone with specific attestation given by the admin on certain schema is able to register.

## Giving attestation

- Navigate to https://maci-platform.vercel.app/voters (replace the domain with your deployment)
- Make sure you have configured `NEXT_PUBLIC_ADMIN_ADDRESS` with the address you connect your wallet with
- Enter a list of addresses you want to allow to vote (comma-separated)
- Press Approve button to create attestations for these voters (send transaction to confirm)

> It can take 10 minutes for the voters to be seen in the UI

[<img width="100%" src="https://cdn.loom.com/sessions/thumbnails/5ee5b309c2334370925a95615ed8bac5-with-play.gif" width="50%">](https://www.loom.com/embed/5ee5b309c2334370925a95615ed8bac5)

You could also give attestation on the [easscan](https://easscan.org/) page.

## Semaphore

As long as you belong to a specific semaphore group can register.

## Hats

Those who are wearing hat with certain id could register.
