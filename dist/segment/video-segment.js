'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualSegment = require('./visual-segment');
var AudioSegment = require('./audio-segment');

module.exports = function (_VisualSegment) {
  _inherits(VideoSegment, _VisualSegment);

  function VideoSegment(options) {
    _classCallCheck(this, VideoSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(VideoSegment).call(this, options));

    _this.segmentType = 'video';

    _this.audioFadeDuration = options.audioFadeDuration || 0;
    _this.videoFadeDuration = options.videoFadeDuration || 0;

    _this.audioHandleMedia = options.audioHandleMedia;
    _this.audioHandleSegmentOptions = options.audioHandleSegmentOptions || {};
    _this.audioHandleFadeDuration = options.audioHandleFadeDuration || 0.25;
    _this.audioHandleStartTimeOffset = options.audioHandleStartTimeOffset || 0.0;

    if (_this.audioHandleMedia) {
      _this.volume = 0;
    } else if (options.volume && !isNaN(parseFloat(options.volume))) {
      _this.volume = options.volume;
    } else {
      _this.volume = 1.0;
    }
    return _this;
  }

  _createClass(VideoSegment, [{
    key: 'copy',
    value: function copy(videoSegment) {
      _get(Object.getPrototypeOf(VideoSegment.prototype), 'copy', this).call(this, videoSegment);

      this.audioFadeDuration = videoSegment.audioFadeDuration;
      this.videoFadeDuration = videoSegment.videoFadeDuration;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new VideoSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setAudioFadeDuration',
    value: function setAudioFadeDuration(audioFadeDuration) {
      this.audioFadeDuration = audioFadeDuration;
      return this;
    }
  }, {
    key: 'setVideoFadeDuration',
    value: function setVideoFadeDuration(videoFadeDuration) {
      this.videoFadeDuration = videoFadeDuration;
      return this;
    }
  }, {
    key: 'setAudioHandleMedia',
    value: function setAudioHandleMedia(audioHandleMedia) {
      this.audioHandleMedia = audioHandleMedia;
      this.setVolume(0);
      return this;
    }
  }, {
    key: 'setAudioHandleFadeDuration',
    value: function setAudioHandleFadeDuration(audioHandleFadeDuration) {
      this.audioHandleFadeDuration = audioHandleFadeDuration;
      return this;
    }
  }, {
    key: 'setAudioHandleStartTimeOffset',
    value: function setAudioHandleStartTimeOffset(audioHandleStartTimeOffset) {
      this.audioHandleStartTimeOffset = audioHandleStartTimeOffset;
      return this;
    }
  }, {
    key: 'setVolume',
    value: function setVolume(volume) {
      this.volume = volume;

      this.notifyChangeHandlers('volume', volume);

      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'video - ' + this.filename;
    }
  }, {
    key: 'associatedSegments',
    value: function associatedSegments() {
      if (!this.audioHandleMedia) {
        return null;
      }

      var audioHandleOptions = this.audioHandleSegmentOptions;
      for (var key in this.audioHandleMedia) {
        if (this.audioHandleMedia.hasOwnProperty(key)) {
          audioHandleOptions[key] = this.audioHandleMedia[key];
        }
      }

      var audioHandleSegment = new AudioSegment(audioHandleOptions);

      audioHandleSegment.setStartTime(this.startTime + this.audioHandleStartTimeOffset).setDuration(this.getDuration() + this.audioHandleFadeDuration * 2).setFadeDuration(this.audioHandleFadeDuration).setPlaybackRate(this.playbackRate).setLoop(this.loop);

      return [{
        segment: audioHandleSegment,
        offset: -this.audioHandleFadeDuration
      }];
    }
  }]);

  return VideoSegment;
}(VisualSegment);