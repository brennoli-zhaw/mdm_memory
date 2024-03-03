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

    //add Text
    let description = document.createElement('p');
    description.innerText = "Karte #" + randomColor + ":"
    remove.innerText = "Karte #" + randomColor + " entfernen"
    
    //ensure unique inputfields
    cardCount++;

    //create markup
    cardWrapper.appendChild(description)
    
    cardWrapper.appendChild(remove)
    inputWrapper.appendChild(cardWrapper)
    cardWrapper.appendChild(hiddenInput)
    //failed multiple file upload attempt
    
    let input= document.createElement('input');
    input.type="file";
    input.name = "image-" + cardCount;
    input.classList.add("card-" + cardCount, "form-control-file");
    input.accept = "image/png, image/jpeg, image/jpg"
    cardWrapper.appendChild(input)
    
    document.querySelector('#card-creator .submit-first').after(inputWrapper);
    updateSubmitButtons();
}

let generatedColors = [];
function randomHexColor(){
    let generatedColor = Math.floor(Math.random()*16777215).toString(16)
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

//add a dynamic eventlistener
document.addEventListener("click", function(e){
    //remove button
    let target = e.target.closest("#card-creator .remove"); // Or any other selector.
    if(target){
        //remove cards
        let removeCard = document.getElementById(target.dataset.card);
        removeCard.classList.add("remove")
        disableSubmitButtons();
    }
    //submit
    target = e.target.closest("#card-creator .submit"); // Or any other selector.
    if(target){
        sendCards(e);
    }
});

//remove card function
document.addEventListener("animationend", function(e){
    if(!e.target.classList.contains("remove") && !e.target.classList.contains("form-group")) return;
    e.target.remove()
    updateSubmitButtons()
    enableSubmitButtons()
});

//submit function
function sendCards(event){
    event.preventDefault();
    let form = event.target.closest("form")
    let formData = new FormData(form);
    //check values
    
    let generatedCards = document.querySelectorAll("#card-creator .form-group");
    for(let generatedCard of generatedCards){
        let elementId = generatedCard.dataset.id
        /*console.log("color-" + elementId + ": "+ formData.get("color-" + elementId));
        console.log("image-" + elementId + ": "+ formData.get("image-" + elementId));*/
    }
    fetch('/retrieveCards', 
        {
            method: 'POST',
            headers: { },
            body: formData
        }).then(
            response => {
                console.log(response)
                response.text().then(function (text) {
                    returned_data = JSON.parse(text)
                    console.log(returned_data);
                    let generatedCards = document.getElementById("generated-cards")
                    for(let image of returned_data){
                        console.log(image);
                        const byteCharacters = atob(image);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        let objectURL = URL.createObjectURL(new Blob([byteArray], { type: 'image/png' }));
                        let img = document.createElement('img');
                        img.src = objectURL;
                        img.classList.add("card-image")
                        generatedCards.appendChild(img)
                    }
                    
                    console.log(text)
                });
            }
        ).then(
            success => console.log(success)
        ).catch(
            error => console.log(error)
    );
        
}

function enableSubmitButtons(){
    let submitButtons = document.querySelectorAll("#card-creator [type='submit']")
    for(let submitButton of submitButtons){
        submitButton.classList.remove("disable");
    }
}

function disableSubmitButtons(){
    let submitButtons = document.querySelectorAll("#card-creator [type='submit']")
    for(let submitButton of submitButtons){
        submitButton.classList.add("disable");
    }
}

/*
pythonshit
colors = request.form
    images = request.files
    print(images)
    image_binary = read_image(images)
    response = make_response(image_binary)
    response.headers.set('Content-Type', 'image/jpeg')
    response.headers.set(
        'Content-Disposition', 'attachment', filename='%s.jpg' % pid)
    return response
    */