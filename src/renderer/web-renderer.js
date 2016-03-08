
var Renderer = require('./renderer');

var TimePerFrame = 16.67;

module.exports = class WebRenderer extends Renderer {
  constructor(options) {
    super(options);

    this.timeToLoadVideo = options.timeToLoadVideo || 4000;
    this.startDelayCorrection = options.startDelayCorrection || 1.8; // this adapts over time
    this.startPerceptionCorrection = options.startPerceptionCorrection || 13; // this is constant

    this.videoSourceMaker = options.videoSourceMaker !== undefined ? options.videoSourceMaker : (filename) =>  {
      return this.mediaConfig.path + filename;
    };

    this.domContainer = document.body;
    this.scheduledRenders = [];

    this.videosPlayed = 0;
    this.meanStartDelay = 0;

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

  scheduleSegmentRender(segment, delay) {
    var when = window.performance.now() + delay;
    this.scheduledRenders.push({
      segment: segment,
      time: when
    });
  }

  renderVideoSegment(segment, {offset=0}) {
    var self = this;

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

    var displayStyle = video.style.display || 'block';
    video.style.display = 'none';
    this.domContainer.appendChild(video);

    var expectedStart = window.performance.now() + offset;
    video.addEventListener('playing', function() {
      var now = window.performance.now();
      var startDelay = now + self.startPerceptionCorrection - expectedStart;

      var endTimeout = segment.msDuration();
      if (startDelay > self.startPerceptionCorrection) {
        endTimeout -= startDelay;
      }

      setTimeout(end, endTimeout);

      self.videosPlayed += 1;
      if (self.videosPlayed === 1) {
        self.meanStartDelay = startDelay;
      }
      else {
        self.meanStartDelay = (self.meanStartDelay * (self.videosPlayed - 1) + startDelay) / (self.videosPlayed);

        if (Math.abs(self.meanStartDelay > 1)) {
          if (self.meanStartDelay > 0.05 && self.startDelayCorrection < 3) {
            self.startDelayCorrection += 0.05;
          }
          else if (self.meanStartDelay < -0.05 && self.startDelayCorrection > 0.05) {
            self.startDelayCorrection -= 0.05;
          }
        }
      }

      if (self.log) {
        console.log(`${now}: start ${filename} | duration ${segment.msDuration()} | start delay ${startDelay}`);
        console.log(`start correction ${self.startDelayCorrection} | mean delay ${self.meanStartDelay}`);
      }
    }, false);

    setTimeout(start, offset - this.startDelayCorrection - this.startPerceptionCorrection);

    function start() {
      video.play();

      video.style.display = displayStyle;
      if (segment.opacity !== 1.0) {
        video.style.opacity = segment.opacity;
      }

      segment.didStart();
    }

    function end() {
      if (self.log) {
        var now = window.performance.now();
        var expectedEnd = expectedStart + segment.msDuration();
        console.log(`${now}: finish ${filename} | end delay: ${now - expectedEnd}`);
      }

      if (segment.loop) {
        video.pause();
        video.currentTime = segment.startTime;
        video.play();
        setTimeout(end, segment.msDuration());
      }
      else {
        video.parentNode.removeChild(video);
        video.src = '';
        segment.cleanup();
      }
    }
  }

};
