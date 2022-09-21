import { ethers, utils } from "ethers"
import govAbi from "../artifacts/contracts/cadaoGovernor.sol/CadaoGovernor.json"
import tokAbi from "../artifacts/contracts/cadaoToken.sol/CadaoToken.json"

// Wrap all functionality needed in a class
export class cadao {
    connected: Boolean = false
    account: String = ''
    governorAddress: string = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    tokenAddress: string = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

    // check if metamask or some other provider injected the ethereum window
    checkIfWalletIsConnected = async () => {

        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request?.({ method: 'eth_requestAccounts' })

                if (accounts instanceof Array<any>) {
                    const account = accounts[0]
                    this.account = account
                    this.connected = true
                }
                else {
                    this.connected = false
                }
            }
            else {
                console.log('No wallet provider found !!!')
            }
        } catch (error) {
            console.log(error)
            this.connected = false
            this.account = ''
        }
    }

    // get max supply
    prob = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const tokenContract = new ethers.Contract(this.tokenAddress, tokAbi.abi, signer)

                let probando = tokenContract.prob()
                console.log(typeof(probando))

            }
        } catch (error) {
            console.log(error)
        }
    }

}

