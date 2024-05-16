$(document).ready(() => {
    console.log('uijs')
    $('.btn-section').each(function() {
        setInterval(animateSectionBtn, 3000)
    });
})

function animateSectionBtn() {
    console.log(this);
}
