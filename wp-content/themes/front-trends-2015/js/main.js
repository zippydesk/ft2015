var FT = {

  init: function() {
    // FT.smoothScroll();
    // FT.previousEvents();
    FT.watchStickyHeader();
    FT.inputBorderAnimation();
    FT.toggleMenu();
    FT.togglePreviousEvents();
    FT.feedLoadMore();
    FT.animateScroll();
    FT.toggleTalksDescriptions();

    var $body = $('body');
    if (FT.supportSticky()) {
      $body.addClass('supports-sticky');
    } else {
      $body.addClass('no-sticky');
    }

  },

  initStickyHeader: function () {
    var container;
    function cloneHeader() {
      var header = document.getElementById('header').cloneNode(true);
      header.classList.add('header-container--cloned');
      header.classList.add('is-visible');
      header.id += "-cloned";

      return header;
    }

    function cloneSpeakersList() {
      var list = document.querySelector('.speakers-list').cloneNode(true);
      list.classList.add('speakers-list--cloned');

      var listWrapper = document.createElement('div');
      listWrapper.classList.add('speakers-list__wrapper');
      listWrapper.classList.add('is-collapsed');
      listWrapper.innerHTML = document.getElementById('speakerListHeaderTpm').textContent;
      listWrapper.appendChild(list)

      $(listWrapper).find('.speakers-list__controll').click(function () {
        listWrapper.classList.toggle('is-collapsed');
        $(container).trigger('is-collapsed');
        $(listWrapper).css({
          marginTop: '-' + ($(listWrapper).outerHeight() + 10) + 'px'
        });
      });

      return listWrapper;
    }

    function createHeader() {
      container = document.createElement('div');
      container.classList.add('sticky-header');
      container.appendChild(cloneHeader());

      if (document.querySelector('.speakers-list')) {
        container.appendChild(cloneSpeakersList());
        container.classList.add('has-speakers-list');
      }

      document.body.appendChild(container);
      return container;
    }

    return createHeader();
  },

  watchStickyHeader: function () {
    if (FT.isMobileViewport()) {
      FT.fixedMobileMenu();
      return;
    }

    var container = FT.initStickyHeader();
    var $container = $(container);
    var $speakerList = $container.find('.speakers-list__wrapper');
    var navbarHeight = 0;
    var speakerListHeader = $speakerList.outerHeight() + 10;

    $speakerList.css({
      marginTop: '-' + speakerListHeader + 'px'
    });

    var lastScrollTop = 0;
    var delta = 10;
    var speakerListTrigger = $('.speakers-list:first').length ? $('.speakers-list:first').offset().top : '';

    function addTopValue() {
      navbarHeight = $container.find('.header-container').outerHeight();
      if (!$container.hasClass('has-speakers-list')) {
        navbarHeight += 20;
      }
      $container.css({
        top: '-82px'
      });
    }
    addTopValue();

    $(window).scroll(function (event) {
      var st = $(this).scrollTop();

      if(Math.abs(lastScrollTop - st) <= delta) {
        return;
      }

      if (st > lastScrollTop){
        container.classList.remove('nav-down');
      } else {
        if (st > 150) {
          container.classList.add('nav-down');
        } else if (st <= 10) {
          container.classList.remove('nav-down');
        }
      }

      if (st > speakerListTrigger) {
        $speakerList.addClass('is-visible');
      } else {
        $speakerList.removeClass('is-visible');
      }

      lastScrollTop = st;
    });
  },

  animateScroll: function() {
    $('a.jumper').click(function (e) {
      e.preventDefault();
      var id = $(this).attr('href');
      var navBar = $('.sticky-header').outerHeight();

      if ($(id).offset().top > $('html').scrollTop()) {
        navBar -= 82;
      }

      navBar += FT.getSpeakerListHeight();

      $("body, html").stop().animate({
        scrollTop: ($(id).offset().top - navBar)
      }, 600);

      history.pushState(null, null, id);
    });
  },

  getSpeakerListHeight: function () {
    var list = $('.speakers-list__wrapper');

    if (list.length > 0 && list.css('margin-top') !== '0px') {
      return list.outerHeight();
    }

    return 0;
  },

  fixedMobileMenu: function () {
    setInterval(function() {
      $('.header-container').toggleClass('is-visible', $(window).scrollTop() >= 75);
    }, 250);
  },

  supportSticky: function() {
      var stickyTestElement = document.createElement("div");
      var prefixTestList = ['', '-webkit-', '-ms-', '-moz-', '-o-'];
      for (var i = 0, l = prefixTestList.length; i < l; i++) {
        stickyTestElement.style.position = prefixTestList[i] + 'sticky';
        if (stickyTestElement.style.position != '')
          return true;
      }

      return false;
  },

  isMobileViewport: function() {
    if (window.innerWidth < 760) {
      return true;
    }

    return false;
  },

  inputBorderAnimation: function() {
    function runAnimation(input) {
      $(input).parents('.form-section__field').toggleClass('form-section__field--loaded');
    }

    $('#register').on("focus blur", 'input', function() {
      runAnimation(this);
    });

    $('.mc-field-group input').on('focus blur', function() {
      runAnimation(this);
    });
  },

  toggleMenu: function() {
    $('.js-menu-open').on('click', function(e) {
      e.preventDefault();
      $('.header-container').toggleClass('is-open');
    });
  },

  togglePreviousEvents: function() {
    var didHide = false;
    var didScroll = false;
    var $prevEvents = $('.header__prev-events');

    $('.js-previous-events a').on('click', function(e) {
      e.preventDefault();
      var parent = $(e.currentTarget).parents('.header-container');
      $prevEvents = $(parent).find('.header__prev-events');

      $prevEvents.slideToggle(200, function() {
        didHide = false;
        didScroll = false;
      });
    });



    $(window).on('scroll', function() {
      if (didScroll || didHide || $prevEvents.css('display') === 'none') {
        return;
      }

      didScroll = true;
      setTimeout(function() {
        $prevEvents.slideToggle(200, function() {
          didHide = true;
        });
      }, 200);

    });
  },

  toggleTalksDescriptions: function () {
    var eventClassName = 'js-event';
    var activeClassName = 'is-active';
    var $schedule = $('#schedule-list');
    var $talks = $schedule.find('.' + eventClassName);
    var $descriptionsLink = $talks.find('.js-toggle-event-description');

    $descriptionsLink.on('click', function (e) {
      e.preventDefault();
      $(this)
        .parents('.' + eventClassName)
        .toggleClass(activeClassName);
    });
  },

  feedLoadMore: function() {
    function insertFeedItem(item) {
      var template = Handlebars.compile($("#feed-template").html());
      item.classes = "feed__item";

      if (item.has_post_thumbnail) {
        item.classes += " feed__item--image";
      } else {
        item.classes += " feed__item--tweet";
      }

      var templateHTML = $(template(item)).hide();
      $('.feed').append(templateHTML);
    };


    $('.js-feed-load-more').on('click', function(e) {
      e.preventDefault();
      $button = $(this);
      var offset = $('[data-feed-post]').length;

      $.ajax({
        url: '/api-feed',
        data: {
          offset: offset
        },
        success: function(reply) {
          if (!reply.load_more) {
            $button.text('No more updates');
            $button.addClass('button--inactive');
          }

          for (var i = 0; i < reply.data.length; ++i) {
            insertFeedItem(reply.data[i]);
          }

          $('.feed__item').slideDown();
        }
      });
    })
  }
};

$(document).ready(function() {
  FT.init();

  Handlebars.registerHelper('eq', function(val, val2, block) {
    if(val == val2){
      return block(this);
    }
  });

  Handlebars.registerHelper('isset', function(val, val2, block) {
    if(typeof val !== "undefined"){
      return block(this);
    }
  });
});
