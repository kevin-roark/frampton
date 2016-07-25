
var TWEEN = require('tween.js');
var Renderer = require('./renderer');
var ScheduledUnit = require('./scheduled-unit');
var dahmer = require('./dahmer');

var TimePerFrame = 16.67;

module.exports = class WebRenderer extends Renderer {
  constructor (options) {
    super(options);

    this.timeToLoadVideo = options.timeToLoadVideo || 4000;
    this.startDelayCorrection = options.startDelayCorrection || 1.8; // this adapts over time
    this.startPerceptionCorrection = options.startPerceptionCorrection || 13; // this is constant

    this.videoSourceMaker = options.videoSourceMaker !== undefined ? options.videoSourceMaker : filename => {
      var mediaPath = this.mediaConfig.path;
      if (mediaPath[mediaPath.length - 1] !== '/') mediaPath += '/';
      return mediaPath + filename;
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

  update (totalTime) {
    window.requestAnimationFrame(this.update.bind(this));
    TWEEN.update(totalTime);

    var now = window.performance.now();
    var timeSinceLastUpdate = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    this.handleScheduledItems(now, timeSinceLastUpdate);

    for (var i = 0; i < this.updateFunctions.length; i++) {
      this.updateFunctions[i].fn(timeSinceLastUpdate);
    }
  }

  handleScheduledItems (now, timeSinceLastUpdate) {
    var timeToLoad = this.timeToLoadVideo + TimePerFrame;
    var scheduledRenders = this.scheduledRenders;

    var toRender = [];
    for (var i = 0; i < scheduledRenders.length; i++) {
      var scheduledRender = scheduledRenders[i];
      var timeUntilStart = scheduledRender.offset - now;

      if (timeUntilStart < timeToLoad) {
        // start to render, and mark for removal
        toRender.push({segment: scheduledRender.segment, options: {offset: Math.max(timeUntilStart, 0)}});
      } else {
        break; // because we sort by offset, we can break early
      }
    }

    if (toRender.length > 0) {
      // remove used-up units
      scheduledRenders.splice(0, toRender.length);

      // actually perform rendering
      for (i = 0; i < toRender.length; i++) {
        var renderModel = toRender[i];
        this.renderSegment(renderModel.segment, renderModel.options);
      }
    }
  }

  addUpdateFunction (fn) {
    var identifier = '' + Math.floor(Math.random() * 1000000000);
    this.updateFunctions.push({
      identifier: identifier,
      fn: fn
    });

    return identifier;
  }

  setTimeout (fn, time) {
    // TODO: let's make this precise with the render loop
    setTimeout(fn, time);
  }

  removeUpdateFunctionWithIdentifier (identifier) {
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

  scheduleSegmentRender (segment, delay) {
    super.scheduleSegmentRender(segment, delay);

    var offset = window.performance.now() + delay;
    var unit = new ScheduledUnit(segment, offset);

    this.insertScheduledUnit(unit, this.scheduledRenders);
  }

  /// Rendering

  renderVideoSegment (segment, { offset = 0 }) {
    var self = this;

    var video = document.createElement('video');
    video.preload = true;
    video.className = 'frampton-video';
    segment._backingVideo = video;

    var filename = video.canPlayType('video/mp4').length > 0 ? segment.filename : segment.extensionlessName() + '.webm';
    video.src = this.videoSourceMaker(filename);

    video.style.zIndex = segment.z;

    if (segment.width) { video.style.width = video.style.height = segment.width; }
    if (segment.top) { video.style.top = segment.top; }
    if (segment.left) { video.style.left = segment.left; }

    video.volume = segment.volume;
    segment.addChangeHandler('volume', function (volume) {
      video.volume = volume;
    });

    video.currentTime = segment.startTime;

    video.playbackRate = segment.playbackRate;
    segment.addChangeHandler('playbackRate', function (playbackRate) {
      video.playbackRate = playbackRate;
    });

    var displayStyle = video.style.display || 'block';
    video.style.display = 'none';
    this.domContainer.appendChild(video);

    var segmentDuration = segment.msDuration();
    var expectedStart = window.performance.now() + offset;

    var hasPlayedFirstTime = false;
    video.addEventListener('playing', function () {
      if (hasPlayedFirstTime) return;

      hasPlayedFirstTime = true;
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
      } else {
        self.meanStartDelay = (self.meanStartDelay * (self.videosPlayed - 1) + startDelay) / (self.videosPlayed);

        if (Math.abs(self.meanStartDelay > 1)) {
          if (self.meanStartDelay > 0.05 && self.startDelayCorrection < 3) {
            self.startDelayCorrection += 0.05;
          } else if (self.meanStartDelay < -0.05 && self.startDelayCorrection > 0.05) {
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

    function start () {
      video.play();

      video.style.display = displayStyle;

      var videoFadeDuration = segment.videoFadeDuration || self.videoFadeDuration;
      if (videoFadeDuration) {
        videoFadeDuration = Math.min(videoFadeDuration, segmentDuration / 2);

        video.style.opacity = 0;
        var transition = 'opacity ' + videoFadeDuration + 'ms';
        dahmer.setTransition(video, transition);

        // fade in
        setTimeout(function () {
          video.style.opacity = segment.opacity;
        }, 1);

        // fade out
        setTimeout(function () {
          video.style.opacity = 0;
        }, segmentDuration - videoFadeDuration);
      } else {
        self.setVisualSegmentOpacity(segment, video);
      }

      self.fadeAudioForVideoSegment(segment, video);

      segment.didStart();
    }

    function end () {
      if (self.log) {
        var now = window.performance.now();
        var expectedEnd = expectedStart + segmentDuration;
        console.log(`${now}: finish ${filename} | end delay: ${now - expectedEnd}`);
      }

      if (segment.loop) {
        video.currentTime = segment.startTime;
        setTimeout(end, segmentDuration);
      } else {
        video.parentNode.removeChild(video);
        video.src = '';
        segment.cleanup();
      }
    }
  }

  fadeAudioForVideoSegment (segment, video) {
    var audioFadeDuration = segment.audioFadeDuration || this.audioFadeDuration;
    if (audioFadeDuration) {
      var segmentDuration = segment.msDuration();
      audioFadeDuration = Math.min(audioFadeDuration, segmentDuration / 2);

      // fade in
      video.volume = 0;
      new TWEEN.Tween(video)
        .to({volume: segment.volume}, audioFadeDuration)
        .start();

      setTimeout(function () {
        // fade out
        new TWEEN.Tween(video)
          .to({volume: 0}, audioFadeDuration)
          .start();
      }, segmentDuration - audioFadeDuration);
    }
  }

  renderTextSegment (segment, { offset = 0 }) {
    var self = this;

    var div = document.createElement('div');
    div.className = 'frampton-text';

    div.style.fontFamily = segment.font;
    div.style.fontSize = segment.fontSize;
    div.style.zIndex = segment.z;
    div.style.textAlign = segment.textAlignment;
    div.style.color = segment.color;

    if (segment.maxWidth) { div.style.maxWidth = segment.maxWidth; }
    if (segment.top) { div.style.top = segment.top; }
    if (segment.left) { div.style.left = segment.left; }

    div.textContent = segment.text;

    div.style.display = 'none';
    this.domContainer.appendChild(div);

    setTimeout(start, offset);
    setTimeout(end, offset + segment.msDuration());

    function start () {
      div.style.display = 'block';
      self.setVisualSegmentOpacity(segment, div);
      segment.didStart();
    }

    function end () {
      div.parentNode.removeChild(div);
      segment.cleanup();
    }
  }

  renderColorSegment (segment, { offset = 0 }) {
    var self = this;

    var div = document.createElement('div');
    div.className = 'frampton-video';

    div.style.zIndex = segment.z;

    if (segment.width) { div.style.width = div.style.height = segment.width; }
    if (segment.top) { div.style.top = segment.top; }
    if (segment.left) { div.style.left = segment.left; }

    if (segment.transitionBetweenColors) { div.style.transition = 'background-color 5ms'; }

    var displayStyle = div.style.display || 'block';
    div.style.display = 'none';
    this.domContainer.appendChild(div);

    var framesDataResponseCallback;
    if (!segment.framesData) {
      if (this.log) {
        console.log(`loading color frames for: ${segment.filename}`);
      }
      this.getJSON(this.videoSourceMaker(segment.filename), framesData => {
        segment.setFramesData(framesData);

        if (framesDataResponseCallback) framesDataResponseCallback();
        framesDataResponseCallback = null;
      });
    }

    if (offset > 0) {
      setTimeout(start, offset);
    } else {
      start();
    }

    function start () {
      if (!segment.framesData) {
        framesDataResponseCallback = () => { start(); };
        return;
      }

      if (self.log) {
        console.log(`displaying colors for: ${segment.filename}`);
      }

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

      function updateColorRender (timeDelta) {
        var deltaWithLeftoverTime = timeDelta + lastUpdateLeftoverTime;

        var frames = Math.floor(deltaWithLeftoverTime / msPerFrame);
        currentFrameIndex += frames;

        lastUpdateLeftoverTime = deltaWithLeftoverTime - frames * msPerFrame;

        if (currentFrameIndex >= segment.numberOfColors()) {
          if (segment.loop) {
            currentFrameIndex = currentFrameIndex - segment.numberOfColors();
          } else {
            end(fnIdentifier);
            return;
          }
        }

        div.style.backgroundColor = segment.rgb(segment.getColor(currentFrameIndex));

        if (self.log) {
          console.log(`${window.performance.now()}: displaying frame ${currentFrameIndex} for color segment - ${segment.simpleName()}`);
        }
      }

      function updateMSPerFrame () {
        msPerFrame = segment.msDuration() / segment.numberOfColors();
      }

      if (self.log) {
        console.log(`${window.performance.now()}: started color segment - ${segment.simpleName()}`);
      }
    }

    function end (fnIdentifier) {
      div.parentNode.removeChild(div);
      segment.cleanup();

      self.removeUpdateFunctionWithIdentifier(fnIdentifier);

      if (self.log) {
        console.log(`${window.performance.now()}: finished color segment - ${segment.simpleName()}`);
      }
    }
  }

  renderImageSegment (segment, { offset = 0 }) {
    var self = this;

    let el = document.createElement('img');
    el.className = 'frampton-image';

    // style
    styleZ(segment.z); segment.addChangeHandler('z', styleZ);
    styleRect(segment.rect); segment.addChangeHandler('rect', styleRect);
    self.setVisualSegmentOpacity(segment, el);

    // hide until start
    el.style.display = 'none';
    this.domContainer.appendChild(el);

    // start up baby
    setTimeout(start, offset);

    function styleZ (z) {
      el.style.zIndex = z;
    }

    function styleRect (rect) {
      el.style.left = (rect.x * 100) + '%';
      el.style.top = (rect.y * 100) + '%';
      el.style.width = (rect.w * 100) + '%';
      el.style.height = (rect.h * 100) + '%';
    }

    function start () {
      if (self.log) {
        console.log(`${window.performance.now()}: starting image segment - ${segment.simpleName()}`);
      }

      el.style.display = 'block';

      segment.didStart();

      let currentFrameIndex = 0;
      let lastUpdateLeftoverTime = 0;
      let msPerFrame = segment.msPerFrame();
      segment.addChangeHandler('fps', () => { msPerFrame = segment.msPerFrame(); });

      updateImage(0);
      let fnIdentifier = self.addUpdateFunction(updateImage);

      function updateImage (timeDelta) {
        let deltaWithLeftoverTime = timeDelta + lastUpdateLeftoverTime;

        let frames = Math.floor(deltaWithLeftoverTime / msPerFrame);
        currentFrameIndex += frames;

        lastUpdateLeftoverTime = deltaWithLeftoverTime - frames * msPerFrame;

        // end or restart if we reach end of the frames
        if (currentFrameIndex >= segment.frameCount()) {
          if (segment.loop) {
            currentFrameIndex = currentFrameIndex - segment.frameCount();
          } else {
            end(fnIdentifier);
            return;
          }
        }

        el.src = this.videoSourceMaker(segment.getFilename(currentFrameIndex));

        if (self.log) {
          console.log(`${window.performance.now()}: displaying frame ${currentFrameIndex} for image segment - ${segment.simpleName()}`);
        }
      }
    }

    function end (fnIdentifier) {
      el.parentNode.removeChild(el);
      segment.cleanup();

      self.removeUpdateFunctionWithIdentifier(fnIdentifier);

      if (self.log) {
        console.log(`${window.performance.now()}: finished image segment - ${segment.simpleName()}`);
      }
    }
  }

  renderAudioSegment (segment, options) {
    if (segment.preferHTMLAudio || options.preferHTMLAudio || this.preferHTMLAudio) {
      this.renderAudioSegmentWithHTMLAudio(segment, options);
    } else {
      this.renderAudioSegmentWithWebAudio(segment, options);
    }
  }

  // helpful web audio documentation: http://www.html5rocks.com/en/tutorials/webaudio/intro/
  renderAudioSegmentWithWebAudio (segment, { offset = 0 }) {
    var self = this;

    var Context = window.AudioContext || window.webkitAudioContext;
    var audioContext = new Context();
    var source = audioContext.createBufferSource();
    var sourceStartTime = audioContext.currentTime + offset / 1000;

    var gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    segment.addChangeHandler('volume', function (volume) {
      gainNode.gain.value = volume;
    });

    if (segment.fadeInDuration) {
      gainNode.gain.linearRampToValueAtTime(0, sourceStartTime);
      gainNode.gain.linearRampToValueAtTime(segment.volume, sourceStartTime + segment.fadeInDuration);
    } else {
      gainNode.gain.value = segment.volume;
    }

    if (segment.fadeOutDuration) {
      gainNode.gain.linearRampToValueAtTime(segment.volume, sourceStartTime + segment.getDuration() - segment.fadeOutDuration);
      gainNode.gain.linearRampToValueAtTime(0, sourceStartTime + segment.getDuration());
    }

    source.start(sourceStartTime, segment.startTime, segment.getDuration());

    var request = new window.XMLHttpRequest();
    request.open('GET', this.videoSourceMaker(segment.filename), true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      var audioData = request.response;

      audioContext.decodeAudioData(audioData,
        function (buffer) {
          source.buffer = buffer;
          source.connect(gainNode);

          source.loop = segment.loop;
          if (segment.loop) {
            source.loopStart = segment.startTime;
            source.loopEnd = segment.endTime();
          }

          source.playbackRate.value = segment.playbackRate;
          segment.addChangeHandler('playbackRate', function (playbackRate) {
            source.playbackRate.value = playbackRate;
          });
        },
        function (e) {
          if (self.log) {
            console.log(`audio decoding erorr: ${e.err}`);
          }
        });
    };

    request.send();
  }

  renderAudioSegmentWithHTMLAudio (segment, { offset = 0 }) {
    var self = this;

    var audio = document.createElement('audio');
    audio.preload = true;
    audio.src = this.videoSourceMaker(segment.filename);
    audio.currentTime = segment.startTime;
    audio.playbackRate = segment.playbackRate;
    segment.addChangeHandler('playbackRate', function (playbackRate) { audio.playbackRate = playbackRate; });
    audio.volume = segment.volume;
    segment.addChangeHandler('volume', function (volume) { audio.volume = volume; });

    var segmentDuration = segment.msDuration();
    var expectedStart = window.performance.now() + offset;

    audio.addEventListener('playing', function () {
      var now = window.performance.now();
      var startDelay = now + self.startPerceptionCorrection - expectedStart;

      var endTimeout = segmentDuration;
      if (startDelay > self.startPerceptionCorrection) {
        endTimeout -= startDelay;
      }

      setTimeout(end, endTimeout);

      if (self.log) {
        console.log(`audio is playing for ${segment.filename}`);
      }
    }, false);

    setTimeout(start, offset - this.startPerceptionCorrection);

    function start () {
      audio.play();

      var fadeInDuration = (1000 * segment.fadeInDuration) || self.audioFadeDuration;
      if (fadeInDuration) {
        fadeInDuration = Math.min(fadeInDuration, segmentDuration / 2);

        audio.volume = 0;
        new TWEEN.Tween(audio)
          .to({volume: segment.volume}, fadeInDuration)
          .start();
      }

      var fadeOutDuration = (1000 * segment.fadeOutDuration) || self.audioFadeDuration;
      if (fadeOutDuration) {
        setTimeout(function () {
          new TWEEN.Tween(audio)
            .to({volume: 0}, fadeOutDuration)
            .start();
        }, segmentDuration - fadeOutDuration);
      }

      if (self.log) {
        console.log(`started playing audio for: ${segment.filename}`);
      }

      segment.didStart();
    }

    function end () {
      if (segment.loop) {
        audio.pause();
        audio.currentTime = segment.startTime;
        audio.play();
        setTimeout(end, segmentDuration);
      } else {
        audio.src = '';
        segment.cleanup();
      }
    }
  }

  /// Rendering Helpers

  setVisualSegmentOpacity (segment, el) {
    if (segment.opacity !== 1.0) {
      el.style.opacity = segment.opacity;
    }
    segment.addChangeHandler('opacity', function (opacity) {
      el.style.opacity = opacity;
    });
  }

  getJSON (url, callback) {
    if (!callback) return;

    var request = new window.XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
      var data = JSON.parse(request.responseText);
      callback(data);
    };

    request.send();
  }

};
