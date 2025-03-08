# Results

As a coordinator, you need to tally the poll results and publish them once the voting has ended.

## Poll finalization

Once the voting time has ended, first you need to merge signups and messages (votes). Head to **MACI** repository and run the merge command with the deployed poll:

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

For more information, see [maci docs](https://maci.pse.dev/docs/integrating#poll-finalization).

Then, everyone should be able to see the results here:

- https://maci-platform.vercel.app/rounds/:roundId/results
