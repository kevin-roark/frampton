
var Renderer = require('./renderer');

module.exports = class WebRenderer extends Renderer {
  constructor(options) {
    super(options);

    this.domContainer = document.body;
    this.timeToLoadVideo = options.timeToLoadVideo || 1000;
    this.scheduledRenders = [];

    console.log('frampton is starting now...');

    this.startTime = window.performance.now();
    this.update(); // get the loop going
  }

  update() {
    window.requestAnimationFrame(this.update.bind(this));

    var offsetFromStart = window.performance.now() - this.startTime;

    for (var i = this.scheduledRenders.length - 1; i >= 0; i--) {
      var scheduledRender = this.scheduledRenders[i];
      var timeUntilStart = scheduledRender.time - offsetFromStart;
      if (timeUntilStart < this.timeToLoadVideo) {
        // start to render, and pop it off
        this.renderSegment(scheduledRender.segment, {offset: Math.max(timeUntilStart, 0)});
        this.scheduledRenders.splice(i, 1);
      }
    }
  }

  renderSequencedSegment(sequenceSegment) {
    var offset = 0;

    sequenceSegment.segments.forEach((segment, idx) => {
      this.scheduleSegmentRender(segment, offset);
      offset += segment.msDuration();

      // last item needs a cleanerupper
      if (idx === sequenceSegment.segmentCount() - 1) {
        var onComplete = segment.onComplete;
        segment.onComplete = () => {
          // call and reset the original
          if (onComplete) {
            onComplete();
          }
          segment.onComplete = onComplete;

          // clean up the sequence
          sequenceSegment.cleanup();
        };
      }
    });
  }

  renderVideoSegment(segment, options) {
    if (!options) options = {};

    var offset = options.offset || 0;

    var video = document.createElement('video');
    video.preload = true;
    video.className = 'frampton-video';

    var filename = video.canPlayType('video/mp4').length > 0 ? segment.filename : segment.extensionlessName() + '.webm';
    video.src = this.mediaConfig.path + filename;

    video.style.zIndex = segment.z;

    video.onended = function() {
      if (segment.loop) {
        video.currentTime = 0;
        video.play();
      }
      else {
        segment.cleanup();

        video.parentNode.removeChild(video);
        video.src = '';
      }
    };

    setTimeout(() => {
      video.play();
      this.domContainer.appendChild(video);
    }, offset);
  }

  scheduleSegmentRender(segment, delay) {
    var offsetFromNow = window.performance.now() + delay;
    this.scheduledRenders.push({
      segment: segment,
      time: offsetFromNow
    });
  }
};
