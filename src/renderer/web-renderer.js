
var TWEEN = require('tween.js');
var Renderer = require('./renderer');
var ScheduledUnit = require('./scheduled-unit');
var dahmer = require('./dahmer');

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

    this.lastUpdateTime = 0;
    this.update(); // get the loop going
  }

  /// Scheduling

  update(totalTime) {
    window.requestAnimationFrame(this.update.bind(this));
    TWEEN.update(totalTime);

    var now = window.performance.now();
    this.lastUpdateTime = now;

    var timeToLoad = this.timeToLoadVideo + TimePerFrame;
    var scheduledRenders = this.scheduledRenders;
    var renderedCount = 0;

    for (var i = 0; i < scheduledRenders.length; i++) {
      var scheduledRender = scheduledRenders[i];
      var timeUntilStart = scheduledRender.offset - now;

      if (timeUntilStart < timeToLoad) {
        // start to render, and mark for removal
        this.renderSegment(scheduledRender.segment, {offset: Math.max(timeUntilStart, 0)});
        renderedCount += 1;
      }
      else {
        break; // because we sort by offset, we can break early
      }
    }

    // remove used-up units
    if (renderedCount > 0) {
      scheduledRenders.splice(0, renderedCount);
    }
  }

  scheduleSegmentRender(segment, delay) {
    var offset = window.performance.now() + delay;
    var unit = new ScheduledUnit(segment, offset);

    this.insertScheduledUnit(unit, this.scheduledRenders);
  }

  /// Rendering

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

    var segmentDuration = segment.msDuration();
    var expectedStart = window.performance.now() + offset;

    video.addEventListener('playing', function() {
      var now = window.performance.now();
      var startDelay = now + self.startPerceptionCorrection - expectedStart;

      var endTimeout = segmentDuration;
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
        console.log(`${now}: start ${filename} | duration ${segmentDuration} | start delay ${startDelay}`);
        console.log(`start correction ${self.startDelayCorrection} | mean delay ${self.meanStartDelay}`);
      }
    }, false);

    setTimeout(start, offset - this.startDelayCorrection - this.startPerceptionCorrection);

    function start() {
      video.play();

      video.style.display = displayStyle;

      var videoFadeDuration = segment.videoFadeDuration || self.videoFadeDuration;
      if (videoFadeDuration) {
        videoFadeDuration = Math.min(videoFadeDuration, segmentDuration / 2);

        video.style.opacity = 0;
        var transition = 'opacity ' + videoFadeDuration + 'ms';
        dahmer.setTransition(video, transition);

        // fade in
        setTimeout(function() {
          video.style.opacity = segment.opacity;
        }, 1);

        // fade out
        setTimeout(function() {
          video.style.opacity = 0;
        }, segmentDuration - videoFadeDuration);
      }
      else {
        if (segment.opacity !== 1.0) {
          video.style.opacity = segment.opacity;
        }
      }

      var audioFadeDuration = segment.audioFadeDuration || self.audioFadeDuration;
      if (audioFadeDuration) {
        audioFadeDuration = Math.min(audioFadeDuration, segmentDuration / 2);

        // fade in
        video.volume = 0;
        new TWEEN.Tween(video)
          .to({volume: 1}, audioFadeDuration)
          .start();

        setTimeout(function() {
          // fade out
          new TWEEN.Tween(video)
            .to({volume: 0}, audioFadeDuration)
            .start();
        }, segmentDuration - audioFadeDuration);
      }

      segment.didStart();
    }

    function end() {
      if (self.log) {
        var now = window.performance.now();
        var expectedEnd = expectedStart + segmentDuration;
        console.log(`${now}: finish ${filename} | end delay: ${now - expectedEnd}`);
      }

      if (segment.loop) {
        video.pause();
        video.currentTime = segment.startTime;
        video.play();
        setTimeout(end, segmentDuration);
      }
      else {
        video.parentNode.removeChild(video);
        video.src = '';
        segment.cleanup();
      }
    }
  }

  renderColorSegment(segment, options) {

  }

};
