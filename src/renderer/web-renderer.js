
var Renderer = require('./renderer');

var TimePerFrame = 16.67;

module.exports = class WebRenderer extends Renderer {
  constructor(options) {
    super(options);

    this.timeToLoadVideo = options.timeToLoadVideo || 4000;
    this.videoSourceMaker = options.videoSourceMaker || this.defaultSourceMaker();

    this.domContainer = document.body;
    this.scheduledRenders = [];

    if (this.log) {
      console.log('frampton is starting now...');
    }

    this.startTime = window.performance.now();
    this.lastUpdateTime = this.startTime;
    this.update(); // get the loop going
  }

  /// Runloop

  update() {
    window.requestAnimationFrame(this.update.bind(this));

    var now = window.performance.now();
    this.lastUpdateTime = now;

    var timeToLoad = this.timeToLoadVideo + TimePerFrame;

    for (var i = this.scheduledRenders.length - 1; i >= 0; i--) {
      var scheduledRender = this.scheduledRenders[i];
      var timeUntilStart = scheduledRender.time - now;

      if (timeUntilStart < timeToLoad) {
        // start to render, and pop it off
        this.renderSegment(scheduledRender.segment, {offset: Math.max(timeUntilStart, 0)});
        this.scheduledRenders.splice(i, 1);
      }
    }
  }

  /// Rendering

  renderVideoSegment(segment, {offset=0}) {
    var video = document.createElement('video');
    video.preload = true;
    video.className = 'frampton-video';

    var filename = video.canPlayType('video/mp4').length > 0 ? segment.filename : segment.extensionlessName() + '.webm';
    video.src = this.videoSourceMaker(filename);

    video.style.zIndex = segment.z;

    if (segment.width) { video.style.width = video.style.height = segment.width; }
    if (segment.top) { video.style.top = segment.top; }
    if (segment.left) { video.style.left = segment.left; }

    video.currentTime = segment.startTime;
    video.playbackRate = segment.playbackRate;

    video.style.opacity = 0;
    this.domContainer.appendChild(video);

    if (this.log) {
      video.onplaying = function() {
        console.log(`playing ${video.src}`);
        console.log(`actual duration: ${video.duration}, segment duration: ${segment.videoDuration}, difference: ${segment.videoDuration - video.duration}`);
      };
    }

    setTimeout(function() {
      start();
      setTimeout(end, segment.msDuration());
    }, offset);

    function start() {
      segment.didStart();
      video.play();
      video.style.opacity = segment.opacity;
    }

    function end() {
      if (segment.loop) {
        video.pause();
        video.currentTime = segment.startTime;
        video.play();
        setTimeout(end, segment.msDuration());
      }
      else {
        segment.cleanup();
        video.style.opacity = 0;
        video.src = '';
        video.parentNode.removeChild(video);
      }
    }
  }

  renderSequencedSegment(sequenceSegment, {offset=0}) {
    sequenceSegment.segments.forEach((segment, idx) => {
      this.scheduleSegmentRender(segment, offset);
      offset += segment.msDuration();

      if (idx === 0) {
        this.overrideOnStart(segment, () => {
          sequenceSegment.didStart();
        });
      }
      else if (idx === sequenceSegment.segmentCount() - 1) {
        this.overrideOnComplete(segment, () => {
          sequenceSegment.cleanup();
        });
      }
    });
  }

  renderStackedSegment(stackedSegment, {offset=0}) {
    stackedSegment.segments.forEach((segment, idx) => {
      var segmentOffset = offset + stackedSegment.msSegmentOffset(idx);
      this.scheduleSegmentRender(segment, segmentOffset);

      if (idx === 0) {
        this.overrideOnStart(segment, () => {
          stackedSegment.didStart();
        });
      }
    });

    setTimeout(stackedSegment.cleanup.bind(stackedSegment), offset + stackedSegment.msDuration());
  }

  /// Scheduling

  scheduleSegmentRender(segment, delay) {
    var when = window.performance.now() + delay;
    this.scheduledRenders.push({
      segment: segment,
      time: when
    });
  }

  /// Utility

  defaultSourceMaker() {
    return (filename) =>  {
        return this.mediaConfig.path + filename;
    };
  }
};
