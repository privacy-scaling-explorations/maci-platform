# Different gating strategy

You can specify the desired [gating strategy](https://maci.pse.dev/docs/developers-references/smart-contracts/Gatekeepers) in the **deploy-config.json** file, see **01_setup.md** and **maci** repository for more information. Using different gating strategies will result in different authentication methods.

# Free for all

Everyone can register to the MACI contract without any authentication.

# EAS

Everyone with specific attestation given by the admin on certain schema is able to register.

## Giving attestation

You could give attestation on the [easscan](https://easscan.org/) page.

## Semaphore

As long as you belong to a specific semaphore group can register.

## Hats

Those who are wearing hat with certain id could register.
