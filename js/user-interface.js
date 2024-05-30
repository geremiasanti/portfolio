const btnSectionAnimationDurationMs = 500;
const btnSectionCicleDurationMs = 3500;
const btnSectionAnimationOffset = btnSectionAnimationDurationMs - 50;

$(document).ready(() => {
    // section button shaking animation (after p5 canvas loaded)
    document.getElementById('p5canvas').addEventListener('firstDrawCompleted', () => {
        animateSectionBtns();
        setInterval(animateSectionBtns, btnSectionCicleDurationMs);
    });;

    // put demos list at the same height of the button (instead of below)
    $('#demos-list').css('top', `-=${$('#btn-demos')[0].offsetHeight}px`);

    // animate demos list in
    $('#btn-demos').click(function() {
        let animationDuration = 900;
        let btn = this;
        let btnRect = btn.getBoundingClientRect();
        let displacePx = btnRect.top + btn.offsetHeight;
        let $list = $('#demos-list'); 

        jQuery.easing.def = 'easeOutExpo';

        $(this).animate(
            { top: `-=${displacePx}px` }, 
            animationDuration
        );

        $list.animate(
            { left: 0, right: 0 }, 
            animationDuration
        );

        setTimeout(() => {
            $('#btn-resume').animate(
                { top: `-=${displacePx}px` }, 
                animationDuration
            );
        }, animationDuration / 7);

        setTimeout(() => {
            $('#demos-list-back-btn').animate(
                { now: "+=180" }, 
                {
                    step: function(now) { $(this).css('transform', `rotate(${now}deg)`); },
                    duration: animationDuration * 1.2
                },
            );
        }, animationDuration / 2);

        setTimeout(() => {
            $list.find('#demos-list-back-btn').addClass('avoid');
            $list.find('.list-group').addClass('avoid');
            calculateBoundsToAvoid();
        }, animationDuration * 1.5);
    });

    // animate demos list out
    $('#demos-list-back-btn').click(() => {
        let animationDuration = 900;
        let $list = $('#demos-list'); 

        jQuery.easing.def = 'easeOutExpo';

        $list.animate(
            { left: '-100%', right: '100%' }, 
            animationDuration
        )

        $('#btn-resume').animate(
            { top: `0px` }, 
            animationDuration
        );
        setTimeout(() => {
            $('#btn-demos').animate(
                { top: `0px` }, 
                animationDuration
            );
        }, animationDuration / 7);

        setTimeout(() => {
            $list.find('#demos-list-back-btn').removeClass('avoid');
            $list.find('.list-group').removeClass('avoid');
            calculateBoundsToAvoid();
            
            // revert back button rotation
            $('#demos-list-back-btn').animate(
                { now: "-=180" }, 
                {
                    step: function(now) { $(this).css('transform', `rotate(${now}deg)`); },
                    duration: animationDuration * 1.2
                },
            );
        }, animationDuration);
    })

    // animate resume in
    $('#btn-resume').click(function() {
        let animationDuration = 900;
        let btn = this;
        let btnRect = btn.getBoundingClientRect();
        let displacePx = btnRect.top + btn.offsetHeight;
        
        jQuery.easing.def = 'easeOutExpo';

        $('#title').animate(
            { top: `-=${displacePx}px` }, 
            animationDuration
        );

        setTimeout(() => {
            $('#resume-div').animate(
                { left: '50%' },
                animationDuration * 2
            );
        }, animationDuration / 7);

        setTimeout(() => {
            $('#btn-demos').animate(
                { top: `-=${displacePx}px` }, 
                animationDuration
            );
        }, animationDuration / 7);

        setTimeout(() => {
            $(this).animate(
                { top: `-=${displacePx}px` }, 
                animationDuration
            );
        }, animationDuration / 3.5);

        setTimeout(() => {
            $('#resume-back-btn').animate(
                { now: "+=180" }, 
                {
                    step: function(now) { $(this).css('transform', `rotate(${now}deg)`); },
                    duration: animationDuration * 1.2
                },
            );
        }, animationDuration / 2);

        setTimeout(() => {
            $('#resume-controls a').addClass('avoid');
            $('#resume-controls span').addClass('avoid');
            $('#resume-img').addClass('avoid');
            calculateBoundsToAvoid();
        }, animationDuration * 2.3);
    });

    // animate resume out
    $('#resume-back-btn').click(() => {
        let animationDuration = 900;

        jQuery.easing.def = 'easeOutExpo';

        $('#resume-div').animate(
            { left: '-50%' },
            animationDuration
        );

        $('#btn-resume').animate(
            { top: `0px` }, 
            animationDuration * 1.5
        );

        setTimeout(() => {
            $('#btn-demos').animate(
                { top: `0px` }, 
                animationDuration * 1.3
            );
        }, animationDuration / 7);

        setTimeout(() => {
            $('#title').animate(
                { top: `0px` }, 
                animationDuration * 1.2
            );
        }, animationDuration / 4);

        setTimeout(() => {
            $('#resume-controls a').removeClass('avoid');
            $('#resume-controls span').removeClass('avoid');
            $('#resume-img').removeClass('avoid');
            calculateBoundsToAvoid();
            
            // revert back button rotation
            $('#resume-back-btn').animate(
                { now: "-=180" }, 
                {
                    step: function(now) { $(this).css('transform', `rotate(${now}deg)`); },
                    duration: animationDuration * 1.2
                },
            );
        }, animationDuration * 1.5);
    })

    $('#copy-email-address').click(function() {
        navigator.clipboard.writeText($(this).data('toCopy')).then(() => {
            $(".copied-alert").css('display', 'block');
            setTimeout(() => {
                $(".copied-alert").fadeOut(1500);
            }, 1000);
        });
    }) 
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
