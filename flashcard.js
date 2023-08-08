

export function flipCard() {
    document.getElementById('card').addEventListener('click', function() {
    this.classList.toggle('hover');
})
};




document.getElementById('revealButton').addEventListener('click', function() {
    var card = `
        <div class="card" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">Card Title</h5>
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
        </div>
    `;

    document.getElementById('cardsContainer').innerHTML += card;
});
// This code will create a new card and append it to the cardsContainer div each time the "Reveal Card" button is pressed. You can customize the card content as needed.





