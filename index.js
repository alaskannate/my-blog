
// EFFECTS / STYLE 
window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    var scrollPosition = window.scrollY || window.scrollTop;
    var maxScroll = document.body.scrollHeight - window.innerHeight;

    // Calculate the opacity and blur based on the scroll position
    var opacity = 1 - scrollPosition / maxScroll;
    var blur = 10 * (scrollPosition / maxScroll); // Adjust the multiplier as needed

    console.log(scrollPosition)

    // Apply the styles
    navbar.style.opacity = opacity;
    navbar.style.backdropFilter = 'blur(' + blur + 'px)';
});

//DYNAMIC UPDATING 
document.getElementById("year").innerHTML = new Date().getFullYear();
