# MACI-PLATFORM

<div>
<a href="https://maci-platform.vercel.app/">View demo</a>
<span>|</span>
<a href="https://discord.com/invite/sF5CT5rzrR">Discord (#🗳️-maci channel)</a>
<span>|</span>
<a href="https://www.youtube.com/watch?v=86VBbO1E4Vk">Video Tutorial</a>
</div>

## Supported Networks

All networks EAS is deployed to are supported. If a network is not supported, you can follow the EAS documentation to deploy the contracts to the network.

- https://docs.attest.sh/docs/quick--start/contracts

#### Mainnets

- Ethereum
- Optimism
- Base
- Arbitrum One & Nova
- Polygon
- Scroll
- Celo
- Linea

#### Testnets

- Sepolia
- Optimism Sepolia
- Base Sepolia
- Polygon Mumbai
- Scroll Sepolia

### Technical details

- **EAS** - Projects, profiles, etc are all stored on-chain in Ethereum Attestation Service
- **Batched requests with tRPC** - Multiple requests are batched into one (for example when the frontend requests the metadata for 24 projects they are batched into 1 request)
- **Server-side caching of requests to EAS and IPFS** - Immediately returns the data without calling EAS and locally serving ipfs cids.
- **MACI** - Minimal Anti-Collusion Infrastructure (MACI) is an open-source public good that serves as infrastructure for private on-chain voting, handles the rounds and private voting of the badgeholders.
