function adjust() {

    bar=$('.navbar-fixed-left')

    $('#container').css({
        'margin-left': bar.width() + $(window).width() * 0.1 + 50
    });

    bar.css({
        'left': -$(this).scrollLeft() + $(window).width() * 0.1
    });
}

$(window).scroll(adjust);
$(window).resize(adjust);
$(window).load(adjust);
