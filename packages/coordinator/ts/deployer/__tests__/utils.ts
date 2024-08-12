import { generatePrivateKey, mnemonicToAccount, privateKeyToAccount } from "viem/accounts"
import { createPublicClient, createWalletClient, http } from "viem"
import { hardhat } from "viem/chains"
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless"
import { signerToSimpleSmartAccount } from "permissionless/_types/accounts"

const hardhatRpc = "http://localhost:8545"
export const getWalletClient = () => {
    return createWalletClient({
        account: mnemonicToAccount("test test test test test test test test test test test junk"),
        chain: hardhat,
        transport: http(hardhatRpc)
    })
}

export const getPaymasterClient = () => {
    return createPimlicoPaymasterClient
}

export const getPublicClient = () => {
    const transport = http(hardhatRpc)

    return createPublicClient({
        chain: hardhat, 
        transport,
        pollingInterval: 100
    })
}

export const getSimpleAccountClient = async () => {
    const publicClient = getPublicClient()

    const smartAccount = await signerToSimpleSmartAccount(publicClient, {
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        signer: privateKeyToAccount(generatePrivateKey())
    })

    return smartAccount
}
