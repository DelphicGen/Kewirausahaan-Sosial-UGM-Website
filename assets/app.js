$(document).ready(function () {
    let mentors = document.querySelectorAll('.item');
    $('.owl-carousel').owlCarousel({
        loop:false,
        margin:10,
        nav:true,
        responsive:{
            0:{
                items: mentors.length / 2 >= 1 ? 1 : mentors.length / 2
            },
            576:{
                items: mentors.length / 2 >= 2 ? 2 : mentors.length / 2
            },
            768:{
                items: mentors.length / 2 >= 3 ? 3 : mentors.length / 2
            },
            992: {
                items: mentors.length / 2 >= 4 ? 4 : mentors.length / 2
            }
        }
    });

    // Our Mentor
    // let pages = document.querySelectorAll('.page');
    // let mentors = document.querySelectorAll('.mentor');
    // let activePageIndex = 0;
    // let mentorsContainerWidth = $('.mentors-container').width();
    // let mentorsWidth = ($('.mentor').width() + 12) * mentors.length - 12 ;

    // console.log(pages, mentorsContainerWidth, mentorsWidth, mentorsContainerWidth/mentorsWidth);

    // pages.forEach((page, index) => {
    //     $(page).click(function() {
    //         $(pages[activePageIndex]).removeClass('active-page');
    //         $(page).addClass('active-page');
    //         activePageIndex = index;
    //     })
    // })

    // Upcoming Event
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
        else slide('left');
    })

    // $('.upcoming-event').on('swipeleft', function(event) {
    //     slide('left');
    // }).on('swiperight', function(event) {   
    //     slide('right');
    // })

    // $(".upcoming-event").swiperight(function() {
    //     slide('right');
    // });

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