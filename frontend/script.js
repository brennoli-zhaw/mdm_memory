/* Create File Inputs */
var cardCount = 0;
function createInputFields(){
    let randomColor = randomHexColor();
    //create elements
    let inputWrapper = document.createElement('div');
    inputWrapper.id = "card-" + cardCount;
    inputWrapper.dataset.id = cardCount;
    inputWrapper.classList.add("form-group", "col-12", "col-md-6")
    let cardWrapper = document.createElement('div');
    cardWrapper.classList.add("card")
    //add random color card
    let hiddenInput = document.createElement('input');
    hiddenInput.type="hidden";
    hiddenInput.classList.add("color-" + cardCount, "form-control-file");
    hiddenInput.name = "color-" + cardCount;
    hiddenInput.value = randomColor;
    
    //add remove button
    let remove = document.createElement('button');
    remove.type = "button"
    remove.classList.add("remove", "btn", "btn-danger");
    remove.dataset.card = "card-" + cardCount;

    //add file input
    let input= document.createElement('input');
    input.type="file";
    input.name = "image-" + cardCount;
    input.classList.add("card-" + cardCount, "form-control-file");
    input.accept = "image/png, image/jpeg, image/jpg"
    

    //add Text
    let description = document.createElement('p');
    description.innerText = "Karte #" + randomColor + ":"
    remove.innerText = "Karte #" + randomColor + " entfernen"
    
    //ensure unique inputfields
    cardCount++;

    //create markup
    cardWrapper.appendChild(description)
    cardWrapper.appendChild(input)
    cardWrapper.appendChild(hiddenInput)
    cardWrapper.appendChild(remove)
    inputWrapper.appendChild(cardWrapper)
    
    document.querySelector('#card-creator .submit-first').after(inputWrapper);
    updateSubmitButtons();
}

let generatedColors = [];
function randomHexColor(){
    //we do not add a hashtag by intend
    let generatedColor = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')
    if(generatedColors.indexOf(generatedColor) !== -1) return randomHexColor();
    generatedColors.push(generatedColor);
    return generatedColor;
}

function updateSubmitButtons(){
    let submitButtons = document.querySelectorAll("#card-creator [type='submit']");
    let generatedCards = document.querySelectorAll("#card-creator .form-group");
    if(generatedCards.length > 1){
        for(let submitButton of submitButtons){
            submitButton.classList.remove("hidden");
        }
    } else{
        for(let submitButton of submitButtons){
            submitButton.classList.add("hidden");
        }
    }

}

function showModal() {
    document.querySelector("dialog").showModal();
}
  
function closeModal(){
    document.querySelector("dialog").close();
}

//add a dynamic eventlistener
document.addEventListener("click", function(e){
    //remove button
    let target = e.target.closest("#card-creator .remove"); // Or any other selector.
    if(target){
        //remove cards
        let removeCard = document.getElementById(target.dataset.card);
        removeCard.classList.add("remove")
        disableElements(document.querySelectorAll("#card-creator [type='submit']"));
    }
    //submit
    target = e.target.closest("#card-creator .submit"); // Or any other selector.
    if(target){
        sendCards(e);
    }
    //card
    target = e.target.closest("#generated-cards.playing .generated-card:not(.face-up)"); // Or any other selector.
    if(target){
        let faceUpCards = document.querySelectorAll(".face-up:not(.found)")
        if(faceUpCards.length == 2){
            for(let faceUpCard of faceUpCards){
                faceUpCard.classList.remove("face-up")
            }
        } else if(faceUpCards.length == 1 && faceUpCards[0].dataset.card == target.dataset.card){
            faceUpCards[0].classList.add("found")
            target.classList.add("found")
        }
        target.classList.add("face-up")
    }
});

//remove card function
document.addEventListener("animationend", function(e){
    if(!e.target.classList.contains("remove") && !e.target.classList.contains("form-group")) return;
    e.target.remove()
    updateSubmitButtons()
    enableElements(document.querySelectorAll("#card-creator [type='submit']"))
});

//submit function
function sendCards(event){
    event.preventDefault();
    let form = event.target.closest("form")
    let formData = new FormData(form);
    let sortedFormData = new FormData;
    //sort formaData, since we prepend dynamically added inputs, the order is upside down
    let sortedFormItems = Array
        .from(formData.entries())
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        console.log(sortedFormItems)
    for(let item of sortedFormItems){
        sortedFormData.append(item[0], item[1])
    }
    //disable formGroups and submit button
    disableElements(document.querySelectorAll("#card-creator .form-group"))
    disableElements(document.querySelectorAll("#card-creator [type='submit']"))

    fetch('/retrieveCards', 
        {
            method: 'POST',
            headers: { },
            body: sortedFormData
        }).then(
            response => {
                response.text().then(function (text) {
                    returned_data = JSON.parse(text)
                    //remove all generated cards first
                    let generatedCards = document.querySelectorAll(".generated-card")
                    for(let generatedCard of generatedCards){
                        generatedCard.remove()
                    }
                    let generatedCardsWrapper = document.getElementById("generated-cards")
                    for(let values of returned_data){
                        //has image
                        let card = document.createElement('div');
                        card.classList.add("generated-card")
                        if(values["image"] !== -1){
                            const image = values["image"]
                            const byteCharacters = atob(image);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            let objectURL = URL.createObjectURL(new Blob([byteArray], { type: 'image/png' }));
                            let img = document.createElement('img');
                            img.src = objectURL;
                            img.classList.add("card-info")
                            img.style.backgroundColor = "#" + values["color"]
                            card.appendChild(img)
                        } else{
                            //take color instead
                            let cardColor = document.createElement('div');
                            cardColor.classList.add("card-info")
                            cardColor.style.backgroundColor = "#" + values["color"]
                            card.appendChild(cardColor)
                        }
                        let pseudoUID = Math.random().toString(36)
                        card.dataset.card = pseudoUID
                        let clone = card.cloneNode(true)
                        generatedCardsWrapper.appendChild(card)
                        generatedCardsWrapper.appendChild(clone)
                    }
                    let formGroups = document.querySelectorAll("#card-creator .form-group")
                    for(let formGroup of formGroups){
                        formGroup.classList.add('remove')
                    }
                    enableElements(document.querySelectorAll("#card-creator [type='submit']"))
                    //show game controls
                    generatedCardsWrapper.classList.remove("playing")
                    resetGame()
                    let controlSection = document.getElementById("play");
                    controlSection.classList.remove("hidden")
                    closeModal()
                });
            }
        ).then(
            success => console.log(success)
        ).catch(
            error => console.log(error)
    );
        
}

function enableElements(elements){
    for(let element of elements){
        element.classList.remove("disable");
    }
}

function disableElements(elements){
    for(let element of elements){
        element.classList.add("disable");
    }
}

function resetGame(){
    let playButton = document.querySelector("#play .btn");
    playButton.innerText = "Spielen"

}

function startGame(){
    let playButton = document.querySelector("#play .btn");
    playButton.innerText = "Neu mischen"
    let generatedCardsWrapper = document.getElementById("generated-cards")
    generatedCardsWrapper.classList.add("playing")
    //shuffle
    for (let i = generatedCardsWrapper.children.length; i >= 0; i--) {
        generatedCardsWrapper.appendChild(generatedCardsWrapper.children[Math.random() * i | 0]);
    }
    //reset if played already
    let generatedCards = document.querySelectorAll(".generated-card")
    for (let generatedCard of generatedCards) {
        generatedCard.classList.remove("face-up", "found")
    }
}