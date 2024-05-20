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
        let animationDuration = 900;
        let btn = this;
        let btnRect = btn.getBoundingClientRect();
        let displacePx = btnRect.top + btn.offsetHeight;
        let $list = $('#demos-list'); 

        jQuery.easing.def = 'easeOutExpo';

        $(this).animate(
            { 
                top: `-=${displacePx}px` 
            }, 
            animationDuration
        );

        $list.css('top', `-=${btn.offsetHeight}`);
        $list.animate(
            { 
                left: btnRect.left + btn.offsetWidth - $list.width()
            }, 
            animationDuration
        );


        setTimeout(() => {
            $('#demos-list-back-btn').animate(
                { now: "+=180" }, 
                {
                    step: function(now) {
                        $(this).css('transform', `rotate(${now}deg)`); 
                    },
                    duration: animationDuration * 1.2
                },
            );
        }, animationDuration / 2);

        setTimeout(() => {
            $list.find('#demos-list-back-btn').addClass('avoid');
            $list.find('.list-group').addClass('avoid');
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
