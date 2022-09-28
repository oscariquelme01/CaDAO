import { ethers, utils } from "ethers"
import { EventEmitter } from "events"
import govAbi from "../artifacts/contracts/cadaoGovernor.sol/CadaoGovernor.json"
import tokAbi from "../artifacts/contracts/cadaoToken.sol/CadaoToken.json"
import vendorAbi from "../artifacts/contracts/cadaoVendor.sol/CadaoVendor.json"

type proposal = {
    id: string
    description: string
}

// Wrap all functionality needed in a class to abstract the interaction with all the contrats
export class Cadao extends EventEmitter {
    connected: Boolean = false
    account: string = ''
    governorAddress: string = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    tokenAddress: string = '0x5fbdb2315678afecb367f032d93f642f64180aa3'
    vendorAddress: string = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
    currentProposal: proposal = { id: '', description: '' }


    // Initialize the current proposal from the blockchain
    loadCurrentProposal = async () => {
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
                console.log("new proposal!")

                this.currentProposal.description = args[8]
                this.currentProposal.id = args[0]

                // emit event handled by the frontend to update the proposal
                this.emit('newProposal', args[8])
            })

            // Callback to be executed when a new vote is casted
            govContract.on("VoteCast", async (...args) => {
                console.log("new vote!")
                this.emit('newVote')
            })
        }

    }

    constructor() {
        super()
    }

    init = async () => {
        await this.loadEventHandlers()
        await this.loadCurrentProposal()
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

    // Retrieve votes for current proposal
    getVotes = async () => {
        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        let block = 67

        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const govContract = new ethers.Contract(this.governorAddress, govAbi.abi, signer)

                const votes = await govContract.proposalVotes(this.currentProposal.id)

                return votes

            }
        } catch (error) {
            console.log(error)
        }

    }

    // Retrieve deadline in blocks
    getProposalDeadline = async () => {
        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const govContract = new ethers.Contract(this.governorAddress, govAbi.abi, signer)

                const deadline = await govContract.state(this.currentProposal.id)
                return deadline

            }
        } catch (error) {
            console.log(error)
        }

    }

    buyTokens = async () => {
        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const vendorContract = new ethers.Contract(this.vendorAddress, vendorAbi.abi, signer)

                await vendorContract.buyTokens({ value: utils.parseEther("0.1") })
                const tokContract = new ethers.Contract(this.tokenAddress, tokAbi.abi, signer)

                // Delegate de vote to the buyer so that the checkpoint is made created inmediatly
                await tokContract.delegate(this.account)
            }
        } catch (error) {
            console.log(error)
        }

    }

    getBalance = async () => {
        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)

                const signer = provider.getSigner()
                const tokContract = new ethers.Contract(this.tokenAddress, tokAbi.abi, signer)

                let balance = await tokContract.balanceOf(this.account)

                return balance
            }
        } catch (error) {
            console.log(error)
        }
    }

    getTotalSupply = async () => {
        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)

                const signer = provider.getSigner()
                const tokContract = new ethers.Contract(this.tokenAddress, tokAbi.abi, signer)

                let totalSupply = await tokContract.totalSupply()

                return totalSupply
            }
        } catch (error) {
            console.log(error)
        }
    }
}

