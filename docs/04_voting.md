# Voting

Once applications have been approved and the voters' addresses have been added, your voters can now signup and then vote for projects.

- Navigate to https://maci-platform.vercel.app/signup
- Click `Join` button to signup and wait for transaction confirmation
- After signing up, you could navigate to https://maci-platform.vercel.app/projects and click the `Add` button on the project card or add your vote amount in the project details page (https://maci-platform.vercel.app/projects/:projectId)
- Click `Ballot` on the navbar to navigate to the ballot page (https://maci-platform.vercel.app/ballot)
- Adjust the allocation
- Click `Submit` and send the transaction
- If you change your mind, just modify them and press submit again

As a coordinator, you need to tally the poll results and publish them using CDN (see `NEXT_PUBLIC_TALLY_URL` env variable). See [maci docs](https://maci.pse.dev/docs/integrating#poll-finalization) for more information.
