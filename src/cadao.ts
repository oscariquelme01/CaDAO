import { ethers, utils } from "ethers"
import govAbi from "../artifacts/contracts/cadaoGovernor.sol/CadaoGovernor.json"

type proposal = {
    id: string
    description: string
}

// Wrap all functionality needed in a class to abstract the interaction with all the contrats
export class Cadao {
    connected: Boolean = false
    account: string = ''
    governorAddress: string = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    currentProposal: proposal = { id: '', description: '' }


    // Initialize the current proposal from the blockchain
    private loadCurrentProposal = async () => {
        // get signer
        let signer
        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                signer = provider.getSigner()
            }
        } catch (error) {
            signer = undefined
            console.log(error)
        }

        if (signer != undefined) {
            const govContract = new ethers.Contract(this.governorAddress, govAbi.abi, signer)

            let proposal = await govContract.retrieveCurrentProposal()
            // this.currentProposal.description = utils.parseBytes32String(proposal[0])
            this.currentProposal.description = proposal[0]
            this.currentProposal.id = proposal[1]

        }

    }

    // Get contracts and handle all the proposal events to update the frontend
    private loadEventHandlers = async () => {
        // get signer
        let signer
        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                signer = provider.getSigner()
            }
        } catch (error) {
            signer = undefined
            console.log(error)
        }

        if (signer != undefined) {

            // Callback to be executed when a new proposal is created
            const govContract = new ethers.Contract(this.governorAddress, govAbi.abi, signer)
            govContract.on("ProposalCreated", async (...args) => {

                this.currentProposal.description = args[8]
                this.currentProposal.id = args[0]

            })
        }

    }

    constructor() {
        this.loadEventHandlers()
        this.loadCurrentProposal()
    }

    // check if metamask or some other provider injected the ethereum window
    checkIfWalletIsConnected = async () => {

        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request?.({ method: 'eth_requestAccounts' })

                if (accounts instanceof Array<any>) { // typescript check
                    const account = accounts[0]
                    this.account = account

                    if (this.connected == false) {
                        this.connected = true
                    }
                } else {
                }
            }
            else {

                console.log('No provider found !!!')
                this.connected = false
                this.account = ''
            }
        } catch (error) {
            console.log(error)
            this.connected = false
            this.account = ''
        }
    }


    // Make new proposal
    propose = async (description: string) => {

        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const govContract = new ethers.Contract(this.governorAddress, govAbi.abi, signer)


                console.log('Submitting proposal...')
                // Call mockup function
                const calldata = govContract.interface.encodeFunctionData("doNothing", [])
                await govContract.propose([this.governorAddress], [0], [calldata], description)

            }

        } catch (error) {
            console.log(error)
        }
    }

    // Vote on current proposal
    vote = async (vote: Number) => {

        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const govContract = new ethers.Contract(this.governorAddress, govAbi.abi, signer)

                await govContract.castVote(this.currentProposal.id, ethers.BigNumber.from(vote))
            }
        } catch (error) {
            console.log(error)
        }

    }

}

