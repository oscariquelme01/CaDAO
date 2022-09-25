import { ethers } from "ethers"
import govAbi from "../artifacts/contracts/cadaoGovernor.sol/CadaoGovernor.json"
import tokAbi from "../artifacts/contracts/cadaoToken.sol/CadaoToken.json"
import boxAbi from "../artifacts/contracts/box.sol/Box.json"

import * as fs from "fs"

import proposals from "./proposals.json"

type Proposal  = { 
    id: string
    proposer: string
    description: string
    targets: string[] | undefined
    values: string[] | undefined
    signatures: string[] | undefined
    calldatas: string[] | undefined
}

// Wrap all functionality needed in a class to abstract the interaction with all the contrats
export class Cadao {
    connected: Boolean = false
    account: String = ''
    governorAddress: string = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    tokenAddress: string = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    boxAddress: string = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'


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

        if (signer != undefined){

            // On proposalCreated, log the proposal into a json file
            const govContract = new ethers.Contract(this.governorAddress, govAbi.abi, signer)
            govContract.on("ProposalCreated", async (...args) => {

                console.log("Proposal tx?: ", args[0])
                console.log("Proposal id: ", args[1])
                
                const proposal: Proposal = {
                    id: args[0].toString(), 
                    proposer: args[1],
                    description: args[8],
                    targets: undefined,
                    calldatas: undefined,
                    signatures: undefined,
                    values: undefined
                }

                let props: any[] = proposals.proposals
                props.push(proposal)
                fs.writeFileSync("./proposals.json", JSON.stringify(proposals))

            })

            const boxContract = new ethers.Contract(this.boxAddress, boxAbi.abi, signer)
            boxContract.on("valueChanged", async (...args) => {
                console.log("Value: ", args[0])
                // TODO: update frontend
            })
        }

    }

    constructor() {
        this.loadEventHandlers()
    }

    // check if metamask or some other provider injected the ethereum window
    // This method will return 1 if the variable this.connected changed its value as a way to indicate that the frontend needs to be changed
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

    // get proposals from the json file (should this be on the index.js?)
    proposals = (): any[] => {
        return proposals.proposals
    }

    // Make new proposal
    propose = async (description: String) => {

        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const govContract = new ethers.Contract(this.governorAddress, govAbi.abi, signer)
                const boxContract = new ethers.Contract(this.boxAddress, boxAbi.abi, signer)

                // Encode the function to pass it as an argument to propose()
                const callData = boxContract.interface.encodeFunctionData('store', [52])

                console.log('Submitting proposal...')
                await govContract.propose([this.boxAddress], [0], [callData], description)

            }
        } catch (error) {
            console.log(error)
        }
    }

    // Retrieve the value from the box 
    retrieve = async () => {

        if (!this.connected) {
            console.log('not connected!!!')
            return
        }

        // Passing undefined since there is no need to make any transaction
        const boxContract = new ethers.Contract(this.boxAddress, boxAbi.abi, undefined)
        const value = await boxContract.retrieve()

        console.log(value)
        // TODO: Update frontend
    }

}

