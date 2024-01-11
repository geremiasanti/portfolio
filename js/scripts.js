const imageUrls = [
    '../resources/media/basking-sharkfactsshutterstock_524750362.jpg',
    '../resources/media/pexels-egor-kamelev-921878.jpg',
    '../resources/media/pexels-jan-venter-6477293.jpg',
    '../resources/media/pexels-juan-j-moralestrejo-6047668.jpg',
    '../resources/media/pexels-volker-thimm-19745508.jpg',
    '../resources/media/placeholder.jpg',
    '../resources/media/plippiploppi.webp',
    '../resources/media/shark.jpg',
    '../resources/media/whaleshark.jpeg',
];

$(document).ready(function() {
    // needed to istantiate images (otherwhise not loaded until shown)
    let $imageCache = $('<div class="cache" />').appendTo('body');    

    let images = preloadImages($imageCache, imageUrls);
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
            if(imageCursor >= imageCount) {
                imageCursor = 0;
                images.sort(() => Math.random() - 0.5);
            }
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
