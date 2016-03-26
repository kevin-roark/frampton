
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
    this.updateFunctions = [];

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
    var timeSinceLastUpdate = now - this.lastUpdateTime;
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
    if (renderedCount > 0) {
      // remove used-up units
      scheduledRenders.splice(0, renderedCount);
    }

    for (i = 0; i < this.updateFunctions.length; i++) {
      this.updateFunctions[i].fn(timeSinceLastUpdate);
    }
  }

  addUpdateFunction(fn) {
    var identifier = '' + Math.floor(Math.random() * 1000000000);
    this.updateFunctions.push({
      identifier: identifier,
      fn: fn
    });

    return identifier;
  }

  removeUpdateFunctionWithIdentifier(identifier) {
    var indexOfIdentifier = -1;
    for (var i = 0; i < this.updateFunctions.length; i++) {
      if (this.updateFunctions[i].identifier === identifier) {
        indexOfIdentifier = i;
        break;
      }
    }

    if (indexOfIdentifier >= 0) {
      this.updateFunctions.splice(indexOfIdentifier, 1);
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
    segment.addChangeHandler('playbackRate', function(playbackRate) {
      video.playbackRate = playbackRate;
    });

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
        self.setVisualSegmentOpacity(segment, video);
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

  renderColorSegment(segment, {offset=0}) {
    var self = this;

    var msPerFrame = segment.msDuration() / segment.numberOfColors();

    var div = document.createElement('div');
    div.className = 'frampton-video';

    div.style.zIndex = segment.z;

    if (segment.width) { div.style.width = div.style.height = segment.width; }
    if (segment.top) { div.style.top = segment.top; }
    if (segment.left) { div.style.left = segment.left; }

    if (segment.transitionBetweenColors) { div.style.transition = `background-color ${Math.floor(msPerFrame*0.75)}ms`; }

    var displayStyle = div.style.display || 'block';
    div.style.display = 'none';
    this.domContainer.appendChild(div);

    if (offset > 0) {
      setTimeout(start, offset);
    }
    else {
      start();
    }

    function start() {
      div.style.display = displayStyle;

      self.setVisualSegmentOpacity(segment, div);

      segment.didStart();

      var msPerFrame;
      var currentFrameIndex = segment.startTime === 0 ? 0 : Math.floor((segment.startTime * 1000) / msPerFrame);
      var lastUpdateLeftoverTime = 0;

      updateMSPerFrame();
      updateColorRender(0);

      segment.addChangeHandler('playbackRate', updateMSPerFrame);

      var fnIdentifier = self.addUpdateFunction(updateColorRender);

      function updateColorRender(timeDelta) {
        var deltaWithLeftoverTime = timeDelta + lastUpdateLeftoverTime;

        var frames = Math.floor(deltaWithLeftoverTime / msPerFrame);
        currentFrameIndex += frames;

        lastUpdateLeftoverTime = deltaWithLeftoverTime - frames * msPerFrame;

        if (currentFrameIndex >= segment.numberOfColors()) {
          if (segment.loop) {
            currentFrameIndex = currentFrameIndex - segment.numberOfColors();
          }
          else {
            end(fnIdentifier);
            return;
          }
        }

        div.style.backgroundColor = segment.rgb(segment.getColor(currentFrameIndex));

        if (self.log) {
          console.log(`${window.performance.now()}: displaying frame ${currentFrameIndex} for color segment - ${segment.simpleName()}`);
        }
      }

      function updateMSPerFrame() {
        msPerFrame = segment.msDuration() / segment.numberOfColors();
      }

      if (self.log) {
        console.log(`${window.performance.now()}: started color segment - ${segment.simpleName()}`);
      }
    }

    function end(fnIdentifier) {
      div.parentNode.removeChild(div);
      segment.cleanup();

      self.removeUpdateFunctionWithIdentifier(fnIdentifier);

      if (self.log) {
        console.log(`${window.performance.now()}: finished color segment - ${segment.simpleName()}`);
      }
    }
  }

  renderAudioSegment(segment, {offset=0}) {
    var self = this;

    var Context = window.AudioContext || window.webkitAudioContext;
    var audioContext = new Context();
    var source = audioContext.createBufferSource();

    var gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = segment.volume;
    segment.addChangeHandler('volume', function(volume) {
      gainNode.gain.value = volume;
    });

    var request = new XMLHttpRequest();
    request.open('GET', this.videoSourceMaker(segment.filename), true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      var audioData = request.response;

      audioContext.decodeAudioData(audioData,
        function(buffer) {
          source.buffer = buffer;
          source.connect(gainNode);

          source.loop = segment.loop;
          if (segment.loop) {
            source.loopStart = segment.startTime;
            source.loopEnd = segment.endTime();
          }

          source.playbackRate.value = segment.playbackRate;
          segment.addChangeHandler('playbackRate', function(playbackRate) {
            source.playbackRate.value = playbackRate;
          });
        },
        function(e) {
          if (self.log) {
            console.log(`audio decoding erorr: ${e.err}`);
          }
        });
    };

    request.send();

    source.start(audioContext.currentTime + offset / 1000, segment.startTime, segment.getDuration());
  }

  /// Rendering Helpers

  setVisualSegmentOpacity(segment, el) {
    if (segment.opacity !== 1.0) {
      el.style.opacity = segment.opacity;
    }
    segment.addChangeHandler('opacity', function(opacity) {
      el.style.opacity = opacity;
    });
  }

};
