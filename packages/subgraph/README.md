# maci-platform-subgraph

1. Make sure you have `{network}.json` file in `config` folder, where network is a CLI name supported for subgraph network [https://thegraph.com/docs/en/developing/supported-networks/](https://thegraph.com/docs/en/developing/supported-networks/).

2. Add network, maci contract address and maci contract deployed block.

```json
{
  "network": "optimism-sepolia",
  "maciContractAddress": "0xD18Ca45b6cC1f409380731C40551BD66932046c3",
  "registryManagerContractAddress": "0xbE6e250bf8B5F689c65Cc79667589A9EBF6Fe8E3",
  "registryManagerContractStartBlock": 13160483,
  "maciContractStartBlock": 11052407
}
```

3. Run `pnpm run build`. You can use env variables `NETWORK` and `VERSION` to switch config files.
4. Run `graph auth --studio {key}`. You can find the key in subgraph studio dashboard; if you're using alchemy graph, skip this step.
5. Run `pnpm run deploy` to deploy subgraph; if you're using alchemy graph, run `pnpm run deploy-alchemy --deploy-key {key}` instead.
