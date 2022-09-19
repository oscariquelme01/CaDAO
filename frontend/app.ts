import { cadao } from "./cadao"

let cadao_instance = new cadao()


let yesButton = document.getElementById('answer-button-yes')

yesButton?.addEventListener('click', function handleClick() { 
    cadao_instance.prob()
})
    
