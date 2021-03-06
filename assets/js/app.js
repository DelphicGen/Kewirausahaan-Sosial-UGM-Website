$(document).ready(function () {
    let article2FullDetails = $('.article2__fullDetails').text();
    $('.article2__fullDetails').html(article2FullDetails);

    let article3FullDetails = $('.article3__fullDetails').text();
    $('.article3__fullDetails').html(article3FullDetails);

    let upcomingEventFullDetails = $('.upcomingEvent__fullDetails').text();
    $('.upcomingEvent__fullDetails').html(upcomingEventFullDetails);

    let mainPageDetail = $('.articles__detail');
    mainPageDetail.map((index, detail) => {
        let content = $(detail).text();
        $(detail).html(content);
    });

    // Navigation
    let navbarLinks2 = document.querySelector('.navbar__links2');
    let navbarHamburger = document.querySelector('.navbar__hamburger');
    let body = document.querySelector('body')
    navbarHamburger?.addEventListener('click', () => {
        navbarHamburger.classList.toggle('open');
        navbarLinks2.classList.toggle('show');
    });

    let navbarDropDownTriggers = document.querySelectorAll('.navbar__dropdownTrigger');
    navbarDropDownTriggers[0]?.addEventListener('click', (e) => {
        e.stopPropagation()
        navbarDropDownTriggers[0].classList.toggle('open');
    });
    navbarDropDownTriggers[1]?.addEventListener('click', (e) => {
        e.stopPropagation()
        navbarDropDownTriggers[1].classList.toggle('open');
    });
    body.addEventListener('click', () => {
        navbarDropDownTriggers[0]?.classList.remove('open');
        navbarDropDownTriggers[1]?.classList.remove('open');
    });

    // Owl Carousel
    let mentors = document.querySelectorAll('.mentor');
    $('.owl-carousel-1').owlCarousel({
        loop:true,
        margin:10,
        nav:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        autoWidth: mentors.length < 4 ? true : false,
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
        loop:true,
        margin:10,
        nav:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        autoWidth: members.length < 4 ? true : false,
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
        loop:true,
        margin:10,
        nav:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        autoWidth: testimonials.length < 3 ? true : false,
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

    let partners = document.querySelectorAll('.partner');
    $('.owl-carousel-4').owlCarousel({
        loop:true,
        margin:10,
        nav:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        autoWidth: partners.length < 3 ? true : false,
        responsive:{
            0:{
                items: partners.length >= 1 ? 1 : partners.length
            },
            576:{
                items: partners.length >= 2 ? 2 : partners.length
            }
        }
    });

    $('.owl-carousel-5').owlCarousel({
        loop:true,
        margin:10,
        nav:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        autoWidth: false,
        responsive:{
            0:{
                items:1
            }
        }
    });

    // Upcoming Event
    let upcomingEvents = document.querySelectorAll('.upcomingEvents__event');
    let upcomingEventList = document.querySelectorAll('.upcomingEvents__list')
    let details = document.querySelectorAll('.upcomingEvents__detailContainer');
    let activeEvent = document.querySelector('.active-event');
    let prev = document.querySelector('.prev');
    let next = document.querySelector('.next');
    let leftControl = document.querySelector('.upcomingEvents__leftControl');
    let rightControl = document.querySelector('.upcomingEvents__rightControl');
    let xDown, xUp;
    let activeIndex = 0;
    let nextIndex = (activeIndex + 1) % upcomingEvents.length;
    let prevIndex = (activeIndex + upcomingEvents.length-1) % upcomingEvents.length;

    $('.upcomingEvents__event').on('click', function() {
        if($(this).hasClass('next')) slide('left');
        else if ($(this).hasClass('prev')) slide('right');
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

    const getTouches = (evt) => {
        return evt.touches || evt.originalEvent.touches;
    }                                                     
    
    const handleTouchStart = (evt) => {
        const firstTouch = getTouches(evt)[0];                                      
        xDown = firstTouch.clientX;                       
    }

    const handleTouchMove = (evt) => {
        if (!xDown) {
            return;
        }

        xUp = evt.touches[0].clientX;

        if(xDown > xUp) slide('left')
        else slide('right')

        xDown = null;                                       
    };

    $(upcomingEventList).on('touchstart', handleTouchStart)
    $(upcomingEventList).on('touchmove', handleTouchMove)

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
        upcomingEvents = document.querySelectorAll('.upcomingEvents__event');
        details = document.querySelectorAll('.upcomingEvents__detailContainer');
        activeIndex = direction === 'left' ? (activeIndex + 1) % upcomingEvents.length : (activeIndex + upcomingEvents.length-1) % upcomingEvents.length;
        nextIndex = (activeIndex + 1) % upcomingEvents.length;
        prevIndex = (activeIndex + upcomingEvents.length-1) % upcomingEvents.length;

    }

});