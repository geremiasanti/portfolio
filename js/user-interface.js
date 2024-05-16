const btnSectionAnimationDurationMs = 500;
const btnSectionCicleDurationMs = 3500;
const btnSectionAnimationOffset = btnSectionAnimationDurationMs - 50;

$(document).ready(() => {
    // section button shaking animation
    document.getElementById('p5canvas').addEventListener("firstDrawCompleted", () => {
        animateSectionBtns();
        setInterval(animateSectionBtns, btnSectionCicleDurationMs);
    });;

    $('#btn-demos').click(function() {
        let displacePx = this.getBoundingClientRect().top + this.offsetHeight;
        jQuery.easing.def = "easeInExpo";
        $(this).animate(
            { top: `-=${displacePx}px` }, 
            700
        );
        setTimeout(() => {
            $(this).removeClass('avoid');
            calculateBoundsToAvoid();
        }, 100)
    });
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
