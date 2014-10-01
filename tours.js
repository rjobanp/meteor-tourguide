//////
  // options = {
  //   name: '',
  //   steps: [{}]
  //   defaultTemplate: Template.blah,
  //   noDefaultStart: false,
  //   onEnd: function() {}
  // }

  // step = {
  //   template: Template.step1,
  //   element: '.blah',
  //   overlay: false,
  //   aboveOverlay: '.bar',
  //   position: 'left',
  //   zIndex: 135
  // }
//////


TourGuide = function(options) {
  options = options || {};
  this.name = options.name;
  this.steps = options.steps;
  this.defaultTemplate = options.defaultTemplate;
  this.onEnd = options.onEnd;
  this.paused = false;
  this.ended = false;
  this.started = false;

  this.step = new ReactiveVar(0);

  if ( !options.noDefaultStart ) {
    this.start();
  }
}

TourGuide.prototype.start = function() {
  $('body').append('<div class="tourguide fade in" id="tourguide-' + this.name + '"><div class="arrow"></div><div class="tourguide-content"></div></div>');
  $('body').append('<div class="tourguide-overlay" id="tourguide-overlay-' + this.name + '"></div>');
  this.tourNode = $('#tourguide-' + this.name);
  this.tourOverlay = $('#tourguide-overlay-' + this.name);

  this.started = true;

  this.updateAutorun = Deps.autorun(function() {
    this.removeStep();
    this.showStep(this.step.get());
    this.lastStep = this.step.get();
  }.bind(this));
}

TourGuide.prototype.next = function() {
  if ( this.steps.length > this.step.get() + 1 )
    this.step.set(this.step.get() + 1);
  else
    this.end();
}

TourGuide.prototype.prev = function() {
  if ( this.step.get() > 0 )
    this.step.set(this.step.get() - 1);
}

TourGuide.prototype.end = function() {
  this.removeStep();
  this.tourNode.remove();
  this.tourOverlay.remove();
  this.step = null;
  this.steps = null;
  this.updateAutorun.stop();
  this.ended = true;
  if ( this.onEnd )
    Tracker.afterFlush(this.onEnd);
}

TourGuide.prototype.removeStep = function() {
  this.tourOverlay.hide();
  $('.tourguide-above-overlay').removeClass('tourguide-above-overlay');
  this.tourNode.hide();
  if ( this.stepRange )
    Blaze.remove(this.stepRange);
}

TourGuide.prototype.showStep = function(stepIndex) {
  var step = this.steps[stepIndex];
  this.paused = false;

  // Render and insert the meteor template for this step into the DOM
  this.stepRange = Blaze.renderWithData(step.template || this.defaultTemplate, step.data, this.tourNode.find('.tourguide-content').get(0));

  this.positionPopover(step);

  // Add overlay if needed
  step.overlay && this.addOverlay(step);
}

TourGuide.prototype.addOverlay = function(step) {
  this.tourOverlay.show();
  Tracker.afterFlush(function() {
    $(step.element).addClass('tourguide-above-overlay');
    $(step.aboveOverlay).addClass('tourguide-above-overlay');
  }.bind(this));
}

TourGuide.prototype.positionPopover = function(step) {
  // Position the popover near the element
  Tracker.afterFlush(function() {
    var element = $(step.element);
    var tourNode = this.tourNode;
    var arrow = this.tourNode.find('.arrow');

    if ( step.position === 'top' ) {
      tourNode.removeClass('right left bottom').addClass('top');
    } else if ( step.position === 'bottom' ) {
      tourNode.removeClass('right left top').addClass('bottom');
    } else if ( step.position === 'left' ) {
      tourNode.removeClass('right top bottom').addClass('left');
    } else {
      tourNode.removeClass('left top bottom').addClass('right');
    }

    var elementOffset = element.offset();

    var offset = { top: 0, left: 0 };
    if (elementOffset) {
      if ( step.position === 'top' ) {
        offset.top = elementOffset.top - tourNode.height();
        offset.left = elementOffset.left + (element.width() - tourNode.width())/2;
      } else if ( step.position === 'bottom' ) {
        offset.top = elementOffset.top + element.height();
        offset.left = elementOffset.left + (element.width() - tourNode.width())/2;
      } else if ( step.position === 'left' ) {
        offset.top = elementOffset.top + (element.height() - tourNode.height()) / 2;
        offset.left = elementOffset.left - tourNode.width() - 10;
      } else {
        offset.top = elementOffset.top + (element.height() - tourNode.height()) / 2;
        offset.left = elementOffset.left + element.width() + 10;
      }
    }

    // If a z-index was set
    if ( step.zIndex ) {
      tourNode.css('z-index', step.zIndex);
    } else {
      tourNode.css('z-index', '');
    }

    // If bottom is cutoff
    var windowHeight = $(window).height();
    if (offset.top + tourNode.height() > windowHeight) {
      offset.top = windowHeight - tourNode.height();
      var arrowTop = elementOffset ? elementOffset.top + element.height() / 2 - 5.5 : 0;
    }

    tourNode.show().offset(offset);
    //arrowTop ? arrow.offset({top: arrowTop}) : arrow.css({'top': '50%'});
  }.bind(this));
}