$(document).ready(function() {
    let $imageCache = $('<div class="cache" />').appendTo('body');    
    let imageUrls = [
        '../resources/media/shark.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Raccoon_in_Central_Park_(35264).jpg/1200px-Raccoon_in_Central_Park_(35264).jpg',
    ];
    preloadImages($imageCache, imageUrls);
});

function preloadImages($imageCache, imageUrls) {
    // preload images
    let images = new Array()
    imageUrls.forEach((url) => {
        let $image = $(`<img src="${url}" />`).appendTo($imageCache);
    });
}
