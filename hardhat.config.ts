import { HardhatUserConfig } from 'hardhat/config'
import "@nomicfoundation/hardhat-toolbox"


const config: HardhatUserConfig = {
    defaultNetwork: "localhost",
    solidity: "0.8.17",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        goerli: {
            url: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
            accounts: [process.env.GOERLI_KEY ? process.env.GOERLI_KEY : '']
        }
    }
}

export default config
