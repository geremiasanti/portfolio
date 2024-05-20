const btnSectionAnimationDurationMs = 500;
const btnSectionCicleDurationMs = 3500;
const btnSectionAnimationOffset = btnSectionAnimationDurationMs - 50;

$(document).ready(() => {
    // section button shaking animation
    document.getElementById('p5canvas').addEventListener('firstDrawCompleted', () => {
        animateSectionBtns();
        setInterval(animateSectionBtns, btnSectionCicleDurationMs);
    });;

    $('#btn-demos').click(function() {
        let btn = this;
        let btnRect = btn.getBoundingClientRect();
        let displacePx = btnRect.top + btn.offsetHeight;
        let $list = $('#demos-list'); 

        let animationDuration = 700;

        jQuery.easing.def = 'easeInExpo';
        $(this).animate(
            { 
                top: `-=${displacePx}px` 
            }, 
            animationDuration
        );

        jQuery.easing.def = 'easeOutExpo';
        $list.animate(
            { 
                top: btnRect.top, 
                left: btnRect.left + btn.offsetWidth - $list.width()
            }, 
            animationDuration
        );
        setTimeout(() => {
            $list.addClass('avoid');
            calculateBoundsToAvoid();
        }, animationDuration);
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
