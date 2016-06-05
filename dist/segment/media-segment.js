'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

/// abstract superclass for VisualSegment, AudioSegment
/// Dynamic properties on web: playbackRate
module.exports = function (_Segment) {
  _inherits(MediaSegment, _Segment);

  function MediaSegment(options) {
    _classCallCheck(this, MediaSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MediaSegment).call(this, options));

    _this.segmentType = 'media';

    // media config
    _this.filename = options.filename;
    _this.mediaDuration = options.duration;
    _this.audioSampleRate = options.audioSampleRate || 44100;

    // segment config
    _this.startTime = options.startTime || 0;
    _this.duration = _this.mediaDuration - _this.startTime;
    _this.playbackRate = options.playbackRate || 1.0;
    _this.loop = options.loop || false;
    return _this;
  }

  _createClass(MediaSegment, [{
    key: 'copy',
    value: function copy(mediaSegment) {
      _get(Object.getPrototypeOf(MediaSegment.prototype), 'copy', this).call(this, mediaSegment);

      this.filename = mediaSegment.filename;
      this.mediaDuration = mediaSegment.mediaDuration;

      this.startTime = mediaSegment.startTime;
      this.duration = mediaSegment.duration;
      this.playbackRate = mediaSegment.playbackRate;
      this.loop = mediaSegment.loop;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new MediaSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setFilename',
    value: function setFilename(filename) {
      this.filename = filename;
      return this;
    }
  }, {
    key: 'setEndTime',
    value: function setEndTime(endTime) {
      this.startTime = endTime - this.duration;
      return this;
    }
  }, {
    key: 'setStartTime',
    value: function setStartTime(startTime) {
      this.startTime = startTime;
      this.duration = Math.min(this.duration, this.mediaDuration - startTime);
      return this;
    }
  }, {
    key: 'setDuration',
    value: function setDuration(duration, startAtEnd) {
      this.duration = Math.min(duration, this.mediaDuration * Math.max(this.playbackRate, 1.0));

      var maximalStartTime = this.mediaDuration - this.duration;
      if (startAtEnd || this.startTime > maximalStartTime) {
        this.startTime = maximalStartTime;
      }

      return this;
    }
  }, {
    key: 'setPlaybackRate',
    value: function setPlaybackRate(playbackRate) {
      this.playbackRate = playbackRate;

      this.notifyChangeHandlers('playbackRate', playbackRate);

      return this;
    }
  }, {
    key: 'setLoop',
    value: function setLoop(loop) {
      this.loop = loop;

      return this;
    }

    // Generators

  }, {
    key: 'extensionlessName',
    value: function extensionlessName() {
      return this.filename.substring(0, this.filename.lastIndexOf('.'));
    }
  }, {
    key: 'endTime',
    value: function endTime() {
      return this.startTime + this.duration;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.duration / this.playbackRate;
    }
  }, {
    key: 'msStartTime',
    value: function msStartTime() {
      return this.startTime * 1000;
    }
  }, {
    key: 'msEndTime',
    value: function msEndTime() {
      return this.endTime() * 1000;
    }
  }]);

  return MediaSegment;
}(Segment);