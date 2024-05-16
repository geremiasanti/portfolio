const btnSectionAnimationDurationMs = 500;
const btnSectionCicleDurationMs = 3500;
const btnSectionAnimationOffset = btnSectionAnimationDurationMs - 50;

$(document).ready(() => {
    document.getElementById('p5canvas').addEventListener("firstDrawCompleted", () => {
        animateSectionBtns();
        setInterval(animateSectionBtns, btnSectionCicleDurationMs);
    });;
});

function animateSectionBtns() {
    let $sectionBtns = $('.btn-section');

    $sectionBtns.each(function(i) {
        // offset animation for each button
        setTimeout(() => {
            // activate animation
            $(this).addClass('vertical-shaking');
            // schedule animation deactivation 
            setTimeout(() => {
                $(this).removeClass('vertical-shaking')
            }, btnSectionAnimationDurationMs)
        }, i * btnSectionAnimationOffset);
    });
}
