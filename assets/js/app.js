$(document).ready(function () {
    let fullDetails = $('.full-details').text();
    $('.full-details').html(fullDetails);
    $('.full-details p').css("margin-top", "12px");
    
    // Wow JS
    new WOW().init();

    // Owl Carousel
    let mentors = document.querySelectorAll('.mentor');
    $('.owl-carousel-1').owlCarousel({
        loop:false,
        margin:10,
        nav:true,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items: mentors.length >= 1 ? 1 : mentors.length
            },
            576:{
                items: mentors.length >= 2 ? 2 : mentors.length
            },
            768:{
                items: mentors.length >= 3 ? 3 : mentors.length
            },
            992: {
                items: mentors.length >= 4 ? 4 : mentors.length
            }
        }
    });

    let members = document.querySelectorAll('.member');
    $('.owl-carousel-2').owlCarousel({
        loop:false,
        margin:10,
        nav:true,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items: members.length >= 1 ? 1 : members.length
            },
            576:{
                items: members.length >= 2 ? 2 : members.length
            },
            768:{
                items: members.length >= 3 ? 3 : members.length
            },
            992: {
                items: members.length >= 4 ? 4 : members.length
            }
        }
    });

    let testimonials = document.querySelectorAll('.testimonial');
    $('.owl-carousel-3').owlCarousel({
        loop:false,
        margin:10,
        nav:true,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items: testimonials.length >= 1 ? 1 : testimonials.length
            },
            576:{
                items: testimonials.length >= 2 ? 2 : testimonials.length
            },
            992: {
                items: testimonials.length >= 3 ? 3 : testimonials.length
            }
        }
    });

    
    $('.direct').click(function() {
        const id = $(this).attr('href');
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $(id).offset().top
        }, 500);
    })

    // Upcoming Event
    let upcomingEvents = document.querySelectorAll('.upcoming-event');
    let details = document.querySelectorAll('.detail');
    let activeEvent = document.querySelector('.active-event');
    let prev = document.querySelector('.prev');
    let next = document.querySelector('.next');
    let leftControl = document.querySelector('.left-control');
    let rightControl = document.querySelector('.right-control');
    let activeIndex = 0;
    let nextIndex = (activeIndex + 1) % upcomingEvents.length;
    let prevIndex = (activeIndex + upcomingEvents.length-1) % upcomingEvents.length;

    $('.upcoming-event').on('click', function() {
        if($(this).hasClass('next')) slide('left');
        else if ($(this).hasClass('prev')) slide('right');
        else slide('left');
    })

    if(upcomingEvents.length === 1) {
        $(leftControl).css({"display" : "none"});
        $(rightControl).css({"display" : "none"});
    }

    $(leftControl).on('click', function() {
        slide('right');
    });

    $(rightControl).on('click', function() {
        slide('left');
    });


    const slide = (direction) => {
        if (upcomingEvents.length == 2) {
                $(next).addClass('active-event').removeClass('next');
                $(activeEvent).addClass('next').removeClass('active-event');
                $(details[activeIndex]).addClass('hidden-event');
                $(details[nextIndex]).removeClass('hidden-event');
        } else if (upcomingEvents.length >= 3) {
            if(direction === 'left') {
                    $(next).addClass('active-event').removeClass('next');
                    $(activeEvent).addClass('prev').removeClass('active-event');
                    $(prev).addClass('hidden-event').removeClass('prev');
                    $(upcomingEvents[(nextIndex + 1) % upcomingEvents.length]).addClass('next').removeClass('hidden-event');
                    $(details[activeIndex]).addClass('hidden-event');
                    $(details[nextIndex]).removeClass('hidden-event');
            } else {
                    $(prev).addClass('active-event').removeClass('prev');
                    $(activeEvent).addClass('next').removeClass('active-event');
                    $(next).addClass('hidden-event').removeClass('next');
                    $(upcomingEvents[(prevIndex + upcomingEvents.length-1) % upcomingEvents.length]).addClass('prev').removeClass('hidden-event');
                    $(details[activeIndex]).addClass('hidden-event');
                    $(details[prevIndex]).removeClass('hidden-event');
            }
        }

        activeEvent = document.querySelector('.active-event');
        prev = document.querySelector('.prev');
        next = document.querySelector('.next');
        upcomingEvents = document.querySelectorAll('.upcoming-event');
        details = document.querySelectorAll('.detail');
        activeIndex = direction === 'left' ? (activeIndex + 1) % upcomingEvents.length : (activeIndex + upcomingEvents.length-1) % upcomingEvents.length;
        nextIndex = (activeIndex + 1) % upcomingEvents.length;
        prevIndex = (activeIndex + upcomingEvents.length-1) % upcomingEvents.length;

    }

});