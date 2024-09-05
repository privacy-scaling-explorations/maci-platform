# Adding projects

- Navigate to https://maci-platform.vercel.app/applications/new (replace the domain with your deployment)
- Fill out profile fields with name, profile image and banner image
- Fill out application fields
  - **name** - the name to be displayed
  - **websiteUrl** - your website url
  - **payoutAddress** - address to send payouts to
  - **contributionDescription** - describe your contribution
  - **impactDescription** - describe your impact
  - **contributionLinks** - links to contributions
  - **fundingSources** - list your funding sources

This will create an Attestation with the Metadata schema and populate the fields:

- `type: "application"`
- `roundId: NEXT_PUBLIC_ROUND_ID`

## Reviewing and approving applications

- Navigate to https://maci-platform.vercel.app/applications (replace the domain with your deployment)
- Make sure you have configured `NEXT_PUBLIC_ADMIN_ADDRESS` with the address you connect your wallet with
- You will see a list of submitted applications
- Press each of them to open the application
- Select the applications you want to approve
- Press Approve button to create attestations for these projects (send transaction to confirm)

> It can take 10 minutes for the applications to be approved in the UI

[<img width="100%" src="https://cdn.loom.com/sessions/thumbnails/cfe9bb7ad0b44aaca4d26a446006386a-with-play.gif" width="50%">](https://www.loom.com/embed/cfe9bb7ad0b44aaca4d26a446006386a?sid=a3765630-b097-41bb-aa8b-7600b6901fe4)
