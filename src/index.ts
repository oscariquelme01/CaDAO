import "./css/style.css"
import { Cadao } from "./cadao"

let cadao = new Cadao()

let decimals = 9

async function updateMarketInfo(){

    let totalSupplyDiv = document.getElementById('market-total-supply') as HTMLDivElement
    let currentBalanceDiv = document.getElementById('market-current-balance') as HTMLDivElement

    let totalSupply = await cadao.getTotalSupply()
    let currentBalance = await cadao.getBalance()

    // This is done to avoid overflow as directly dividing by 10^18 overflows
    let tenToThePowerOfNine = Math.pow(10, decimals)

    totalSupplyDiv.innerText = `Total supply: ${totalSupply.div(tenToThePowerOfNine)}`
    currentBalanceDiv.innerText = `Current balance: ${currentBalance.div(tenToThePowerOfNine)}`
} 

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
        forVotes = votes[2].toNumber() / Math.pow(10, decimals)
        againstVotes = votes[1].toNumber() / Math.pow(10, decimals)

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

async function updateCurrentProposal(proposal: string) {
    let question = document.getElementById('question') as HTMLDivElement
    question.innerText = proposal

    let state = await cadao.getProposalState()
    let stateDiv = document.getElementById('question-state') as HTMLDivElement

    switch (state) {
        case 0:
            stateDiv.innerHTML = 'State: Pending...'
            break;

        case 1:
            stateDiv.innerHTML = 'State: Active'
            break;

        case 2:
            stateDiv.innerHTML = 'State: Canceled'
            break;

        case 3:
            stateDiv.innerHTML = 'State: Defeated'
            break;

        case 4:
            stateDiv.innerHTML = 'State: Succeded'
            break;

        case 5:
            stateDiv.innerHTML = 'State: Queued'
            break;

        case 6:
            stateDiv.innerHTML = 'State: Expired'
            break;

        case 7:
            stateDiv.innerHTML = 'State: Executed'
            break;

        default:
            break;
    }

    //Update the time for the proposal
    let timeInfo = document.getElementById('vote-count-info') as HTMLDivElement

    if (Number(cadao.currentProposal.id)){
        let dates = await cadao.getProposalDates()

        if (dates){
            let startDate = new Date(dates['startDate'] * 1000)
            // This will be true if the block has already been mined
            if('endDate' in dates){
                let endDate = new Date(dates['endDate'] * 1000)
                timeInfo.innerText = `Proposal began at ${startDate.toLocaleTimeString()} and ended at ${endDate.toLocaleTimeString()}`
            }
            else {
                let endDate = new Date(startDate.getTime() + 10*60*1000) // 10 minutes since js counts in ms and that is what proposals last
                timeInfo.innerText = `Proposal began at ${startDate.toLocaleTimeString()} and will end at ${endDate.toLocaleTimeString()}`
            }
        }
    }

}

async function main() {

    // Initialize basic cadao object attributes since constructor can't be async
    await cadao.checkIfWalletIsConnected()
    await cadao.init()


    // --------------- Initial state for the frontend ---------------

    // Initial state for the connect to wallet button
    updateConnectButton(cadao.connected)
    updateCurrentProposal(cadao.currentProposal.description)
    updateVoteSection()
    updateMarketInfo()


    // --------------- button click event listeners ---------------

    // Connect wallet button
    document.getElementById('connect-wallet-button')?.addEventListener('click', async () => {
        await cadao.checkIfWalletIsConnected()
    })

    // Vote no button
    document.getElementById('answer-button-no')?.addEventListener('click', async () => {
        if(!Number(cadao.currentProposal.id)){
            window.alert("No proposal yet!")
            return
        }

        let votingPower = await cadao.getVotingPower()
        if(!votingPower.toNumber()){
            window.alert("You have no voting power!")
            return
        }

        await cadao.vote(1)
    })

    // Vote yes button
    document.getElementById('answer-button-yes')?.addEventListener('click', async () => {
        if(!Number(cadao.currentProposal.id)){
            window.alert("No proposal yet!")
            return
        }

        let votingPower = await cadao.getVotingPower()
        if(!votingPower.toNumber()){
            window.alert("You have no voting power!")
            return
        }

        await cadao.vote(2)
    })

    // Buy tokens button
    document.getElementById('market-buy-button')?.addEventListener('click', async () => {
        await cadao.buyTokens()
        updateMarketInfo()
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
    cadao.on('newProposal', async function (){
        updateVoteSection()
        updateCurrentProposal(cadao.currentProposal.description)
    })
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
