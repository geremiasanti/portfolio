const imageUrls = [
    'resources/media/raccoons/pexels-alexas-fotos-10767665.jpg',
    'resources/media/raccoons/pexels-andrey-yudkin-9179705.jpg',
    'resources/media/raccoons/pexels-anna-hinckel-5873489_5_11zon.jpg',
    'resources/media/raccoons/pexels-david-selbert-6468064.jpg',
    'resources/media/raccoons/pexels-david-selbert-6482720.jpg',
    'resources/media/raccoons/pexels-david-selbert-7465116_2_11zon.jpg',
    'resources/media/raccoons/pexels-david-selbert-7515370.jpg',
    'resources/media/raccoons/pexels-david-selbert-8810621_1_11zon.jpg',
    'resources/media/raccoons/pexels-pixabay-54602.jpg',
    'resources/media/raccoons/pexels-thomas-shockey-14575912_4_11zon.jpg',
    'resources/media/raccoons/pexels-tina-nord-7049866_3_11zon.jpg',
    'resources/media/raccoons/pexels-vadim-braydov-12221953_6_11zon.jpg',
    'resources/media/raccoons/pexels-volker-thimm-19745509.jpg',
    'resources/media/raccoons/pexels-zoosnow-5826510.jpg',
];

$(document).ready(function() {
    // needed to istantiate images (otherwhise not loaded until shown)
    let $imageCache = $('<div class="cache" />').appendTo('body');    

    let images = preloadImages($imageCache, imageUrls);
    initGlitchImagesOnHover(
        $('.glitch-images-on-hover'), 
        $('#background-for-images'), 
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
    let timeoutMs = 200;
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
