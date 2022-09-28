import { HardhatUserConfig } from 'hardhat/config'
import "@nomicfoundation/hardhat-toolbox"

import * as secrets from "./secrets.json"

const config: HardhatUserConfig = {
    defaultNetwork: "localhost",
    solidity: "0.8.17",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
            accounts: secrets.accounts.hardhat_keys
        }
    }
}

export default config
