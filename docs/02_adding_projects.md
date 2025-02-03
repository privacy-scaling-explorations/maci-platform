# Adding projects

- Navigate to https://maci-platform.vercel.app/rounds/:roundId/proposals/new (replace the domain with your deployment)
- Fill out profile fields with name, profile image and banner image
- Fill out application fields
  - **name** - the name to be displayed
  - **websiteUrl** - your website url
  - **payoutAddress** - address to send payouts to
  - **contributionDescription** - describe your contribution
  - **impactDescription** - describe your impact
  - **contributionLinks** - links to contributions
  - **fundingSources** - list your funding sources

This will create a request with the Metadata to the registry contract.

## Reviewing and approving proposals

- Navigate to https://maci-platform.vercel.app/rounds/:roundId/proposals (replace the domain with your deployment)
- Make sure you have configured `NEXT_PUBLIC_ADMIN_ADDRESS` with the address you connect your wallet with
- You will see a list of submitted proposals
- Press each of them to check the detail
- Select the proposals you want to approve
- Press Approve button to submit approval on registry contract for these project proposals (send transaction to confirm)

> It can take 10 minutes for the proposals to be approved in the UI

[<img width="100%" src="https://cdn.loom.com/sessions/thumbnails/cfe9bb7ad0b44aaca4d26a446006386a-with-play.gif" width="50%">](https://www.loom.com/embed/cfe9bb7ad0b44aaca4d26a446006386a?sid=a3765630-b097-41bb-aa8b-7600b6901fe4)

:::info
Please be advised that currently due to the MACI's trusted setup artifacts available, you can only have up to 125 projects per round. Please refer to the [trusted setup](https://maci.pse.dev/docs/security/trusted-setup) documentation for more details on the available artifacts and their limits.
:::
