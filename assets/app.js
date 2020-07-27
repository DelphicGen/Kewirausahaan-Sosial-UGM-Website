$(document).ready(function () {
    let upcomingEvents = document.querySelectorAll('.upcoming-event');
    let active = document.querySelector('.active');
    let prev = document.querySelector('.prev');
    let next = document.querySelector('.next');
    let activeIndex = 0;
    let nextIndex = (activeIndex + 1) % upcomingEvents.length;
    let prevIndex = (activeIndex + 4) % upcomingEvents.length;
    

    $('.upcoming-event').on('click', function() {
        if($(this).hasClass('next')) slide('left');
        else if ($(this).hasClass('prev')) slide('right');
    })

    const slide = (direction) => {
        if(direction === 'left') {
            $(next).addClass('active').removeClass('next');
            $(active).addClass('prev').removeClass('active');
            $(prev).addClass('hidden-event').removeClass('prev');
            $(upcomingEvents[(nextIndex + 1) % upcomingEvents.length]).addClass('next').removeClass('hidden-event');
        } else {
            $(prev).addClass('active').removeClass('prev');
            $(active).addClass('next').removeClass('active');
            $(next).addClass('hidden-event').removeClass('next');
            $(upcomingEvents[(prevIndex + 4) % upcomingEvents.length]).addClass('prev').removeClass('hidden-event');
        }

        active = document.querySelector('.active');
        prev = document.querySelector('.prev');
        next = document.querySelector('.next');
        upcomingEvents = document.querySelectorAll('.upcoming-event');
        activeIndex = direction === 'left' ? (activeIndex + 1) % upcomingEvents.length : (activeIndex + 4) % upcomingEvents.length;
        nextIndex = (activeIndex + 1) % upcomingEvents.length;
        prevIndex = (activeIndex + 4) % upcomingEvents.length;

    }

    

});