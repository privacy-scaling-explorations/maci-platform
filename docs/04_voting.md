# Voting

Once project proposals have been approved, and the `initPoll` is run, your voters who already have signed up can now vote for projects.

- Navigate to https://maci-platform.vercel.app/signup
- Click `Join` button to signup and wait for transaction confirmation
- After signing up, you could navigate to https://maci-platform.vercel.app/rounds/:roundId and click the `Add` button on the project card or add your vote amount in the project details page (https://maci-platform.vercel.app/rounds/:roundId/:projectId)
- Click `Ballot` on the navbar to navigate to the ballot page (https://maci-platform.vercel.app/rounds/:roundId/ballot)
- Adjust the allocation
- Click `Submit` and send the transaction
- If you change your mind, just modify them and press submit again

:::info
Please be advised that due to the block gas limit for most EVM networks, the number of votes that can be sent in one batch has been limited to 50. The effort to increase the limit is tracked [here](https://github.com/privacy-scaling-explorations/maci-platform/issues/31). For a list of supported networks and maximum number of votes per batch, please refer to [MACI docs](https://maci.pse.dev/docs/developers-references/smart-contracts/SupportedNetworks).
:::
