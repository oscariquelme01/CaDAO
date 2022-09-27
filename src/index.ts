import "./css/style.css"
import { Cadao } from "./cadao"

let cadao = new Cadao()

function updateConnectButton(state: Boolean) {
    let connectButton = document.getElementById('connect-wallet-button') as HTMLButtonElement
    let innerDiv = connectButton.firstElementChild as HTMLDivElement
    let style = getComputedStyle(document.body)

    if (state) {
        innerDiv.innerText = 'Wallet connected!!'
        connectButton.style.backgroundColor = style.getPropertyValue('--approve-color')
    }
    else {
        innerDiv.innerText = 'Connect to wallet'
        connectButton.style.backgroundColor = style.getPropertyValue('--bg-button-color')
    }

}

async function updateVoteSection() {
    let nobodyVoted: boolean = false
    let forVotes: number = 0
    let againstVotes: number = 0

    // Check whether there is an actual proposal
    if (cadao.currentProposal.id) {

        // Get vote count, index 0 are for votes, index 1 are against votes
        let votes = await cadao.getVotes()
        console.log(votes)
        forVotes = votes[0].toNumber()
        againstVotes = votes[1].toNumber()

        if (forVotes == 0 && againstVotes == 0) {
            nobodyVoted = true
        }
    } else{
        nobodyVoted = true
    }


    // Update the text section
    let forCount = document.getElementById('vote-count-for') as HTMLSpanElement
    let againstCount = document.getElementById('vote-count-against') as HTMLSpanElement

    if (nobodyVoted) {
        forCount.innerText = 'In favour: 0'
        againstCount.innerText = 'Against: 0'
    } else {
        forCount.innerText = `In favour: ${forVotes}`
        againstCount.innerText = `Against: ${againstVotes}`
    }

    // Update the graph section
    let forGraphCount = document.getElementById('vote-count-graph-for') as HTMLSpanElement
    let againstGraphCount = document.getElementById('vote-count-graph-against') as HTMLSpanElement

    if (nobodyVoted) {
        forGraphCount.style.flexGrow = '1'
        againstGraphCount.style.flexGrow = '1'
    } else {
        forGraphCount.style.flexGrow = `${forVotes}`
        againstGraphCount.style.flexGrow = `${againstVotes}`
    }
}

function updateCurrentProposal(proposal: string) {
    let question = document.getElementById('question') as HTMLDivElement
    question.innerText = proposal
}

async function main() {

    // Initialize basic cadao object attributes
    await cadao.checkIfWalletIsConnected()


    // --------------- Initial state for the frontend ---------------

    // Initial state for the connect to wallet button
    updateConnectButton(cadao.connected)
    updateCurrentProposal(cadao.currentProposal.description)
    updateVoteSection()


    // --------------- button click event listeners ---------------

    // Connect wallet button
    document.getElementById('connect-wallet-button')?.addEventListener('click', async () => {
        await cadao.checkIfWalletIsConnected()
    })

    // Vote no button
    document.getElementById('answer-button-no')?.addEventListener('click', async () => {
        // await cadao.vote(0)
        console.log(await cadao.getVotes())
    })

    // Vote yes button
    document.getElementById('answer-button-yes')?.addEventListener('click', async () => {
        await cadao.vote(1)
    })


    // --------------- Metamask wallet event handlers ---------------
    window.ethereum?.on('accountsChanged', async function(accounts) {
        if (accounts instanceof Array<String>) {
            // if accounts is empty then the user disconnected from metamask
            // if its not, then the user either connected or switched accounts
            let status = accounts.length != 0

            updateConnectButton(status)

            cadao.connected = status
            if (status) {
                cadao.account = accounts[0]
            } else {
                cadao.account = ''
            }
        }

    })


    // --------------- Handling cadao class events ---------------
    cadao.on('newProposal', updateCurrentProposal)
    cadao.on('newVote', updateVoteSection)


    // --------------- Using the form to make proposals ---------------
    let form = document.getElementById('proposal-form') as HTMLFormElement

    form.addEventListener('submit', (event: Event) => {
        // Prevent reloading
        event.preventDefault()

        let proposal = form.elements[0] as HTMLInputElement
        cadao.propose(proposal.value)

        proposal.value = ''
    })

} // end main

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
