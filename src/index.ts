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

async function main() {

    // Initialize basic cadao object attributes
    await cadao.checkIfWalletIsConnected()

    // Initial state for the connect to wallet button
    if (cadao.connected) {
        updateConnectButton(true)
    }

    // --------------- button click event listeners ---------------

    // Connect wallet button
    document.getElementById('connect-wallet-button')?.addEventListener('click', async () => {
        await cadao.checkIfWalletIsConnected()
    })

    // Vote no button
    document.getElementById('answer-button-no')?.addEventListener('click', async () => {
        console.log(cadao.currentProposal.description)
        await cadao.vote(0)
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

    // --------------- Using the form to make proposals ---------------
    let form = document.getElementById('proposal-form') as HTMLFormElement

    form.addEventListener('submit', (event: Event) => {
        // Prevent reloading
        event.preventDefault()

        let proposal = form.elements[0] as HTMLInputElement
        console.log(proposal.value)
        cadao.propose(proposal.value)

        proposal.value = ''
    })

} // end main

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
