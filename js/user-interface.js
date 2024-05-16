const btnSectionAnimationDurationMs = 500;
const btnSectionCicleDurationMs = 3500;
const btnSectionCiclePauseMs = 1500;

$(document).ready(() => {
    setInterval(() => {
        let $sectionBtns = $('.btn-section');
        let animationOffset = (btnSectionCicleDurationMs - btnSectionCiclePauseMs) / $sectionBtns.length;

        $sectionBtns.each(function(i) {
            // offset animation for each button
            setTimeout(() => {
                // activate animation
                $(this).addClass('vertical-shaking');
                // schedule animation deactivation 
                setTimeout(() => {
                    $(this).removeClass('vertical-shaking')
                }, btnSectionAnimationDurationMs)
            }, i * animationOffset);
        });
    }, btnSectionCicleDurationMs);
})
