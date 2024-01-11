const IMAGE_URLS = [
    '../resources/media/shark.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Raccoon_in_Central_Park_(35264).jpg/1200px-Raccoon_in_Central_Park_(35264).jpg',
];

$(document).ready(function() {
    // needed to istantiate images (otherwhise not loaded until shown)
    let $imageCache = $('<div class="cache" />').appendTo('body');    

    let images = preloadImages($imageCache, IMAGE_URLS);
    initGlitchImagesOnHover(
        $('.glitch-images-on-hover'), 
        $('#background'), 
        images
    );
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

function initGlitchImagesOnHover($hoverElement, $background, images) {
    let timeoutMs = 100;
    let hovering = false;

    let imageCursor = 0;
    let imageCount = images.length

    // loop
    window.setInterval(function () {
        if(hovering) {
            // update background
            $background.css("background-image",
                `url('${images[imageCursor].attr('src')}')`
            );

            // update cursor
            imageCursor++;
            if(imageCursor >= imageCount) 
                imageCursor = 0;
        }
    }, timeoutMs);

    // loop activation or pause
    $hoverElement.hover(
        () => {
            hovering = true; 
        }, () => {
            hovering = false;
    });
}
