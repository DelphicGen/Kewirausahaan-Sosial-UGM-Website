$(document).ready(function () {
    let upcomingEvents = document.querySelectorAll('.upcoming-event');
    let details = document.querySelectorAll('.detail');
    let active = document.querySelector('.active');
    let prev = document.querySelector('.prev');
    let next = document.querySelector('.next');
    let leftControl = document.querySelector('.left-control');
    let rightControl = document.querySelector('.right-control');
    let activeIndex = 0;
    let nextIndex = (activeIndex + 1) % upcomingEvents.length;
    let prevIndex = (activeIndex + 4) % upcomingEvents.length;

    $('.upcoming-event').on('click', function() {
        if($(this).hasClass('next')) slide('left');
        else if ($(this).hasClass('prev')) slide('right');
    }).on('swipeleft', function() {
        console.log('Hi')
        slide('left');
    }).on('swiperight', function() {
        slide('right');
    })

    $(leftControl).on('click', function() {
        slide('right');
    });

    $(rightControl).on('click', function() {
        slide('left');
    });

    const slide = (direction) => {
        if(direction === 'left') {
            $(next).addClass('active').removeClass('next');
            $(active).addClass('prev').removeClass('active');
            $(prev).addClass('hidden-event').removeClass('prev');
            $(upcomingEvents[(nextIndex + 1) % upcomingEvents.length]).addClass('next').removeClass('hidden-event');
            $(details[activeIndex]).addClass('hidden-event');
            $(details[nextIndex]).removeClass('hidden-event');
        } else {
            $(prev).addClass('active').removeClass('prev');
            $(active).addClass('next').removeClass('active');
            $(next).addClass('hidden-event').removeClass('next');
            $(upcomingEvents[(prevIndex + 4) % upcomingEvents.length]).addClass('prev').removeClass('hidden-event');
            $(details[activeIndex]).addClass('hidden-event');
            $(details[prevIndex]).removeClass('hidden-event');
        }

        active = document.querySelector('.active');
        prev = document.querySelector('.prev');
        next = document.querySelector('.next');
        upcomingEvents = document.querySelectorAll('.upcoming-event');
        details = document.querySelectorAll('.detail');
        activeIndex = direction === 'left' ? (activeIndex + 1) % upcomingEvents.length : (activeIndex + 4) % upcomingEvents.length;
        nextIndex = (activeIndex + 1) % upcomingEvents.length;
        prevIndex = (activeIndex + 4) % upcomingEvents.length;

    }

    

});