const TIMEOUT = 250;

$(document).ready(function() {
    // needed to istantiate images (otherwhise not loaded until shown)
    let $imageCache = $('<div class="cache" />').appendTo('body');    

    let imageUrls = [
        '../resources/media/shark.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Raccoon_in_Central_Park_(35264).jpg/1200px-Raccoon_in_Central_Park_(35264).jpg',
    ];
    let images = preloadImages($imageCache, imageUrls);
    initGlitchImagesOnHover(images);
});

function preloadImages($imageCache, imageUrls) {
    // instantiate img elements inside div.cache
    let images = new Array()
    imageUrls.forEach((url) => {
        let $image = $(`<img src="${url}" />`).appendTo($imageCache);
        images.push($image);
    });

    return images;
}

function initGlitchImagesOnHover(images) {
    let hovering = false;

    // loop
    window.setInterval(function () {
        if (hovering) {
            console.log('hovering'); 
            // TODO: change background
        }
    }, TIMEOUT);

    // loop activation or pause
    $('.glitch-images-on-hover').hover(
        () => {
            hovering = true; 
        }, () => {
            hovering = false;
    });
}
