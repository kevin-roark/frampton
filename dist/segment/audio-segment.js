'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MediaSegment = require('./media-segment');

/// Play some audio!!
/// Dynamic properties on web: volume
module.exports = function (_MediaSegment) {
  _inherits(AudioSegment, _MediaSegment);

  function AudioSegment(options) {
    _classCallCheck(this, AudioSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioSegment).call(this, options));

    _this.segmentType = 'audio';

    _this.volume = options.volume || 0.8;
    _this.fadeInDuration = options.fadeInDuration;
    _this.fadeOutDuration = options.fadeOutDuration || _this.fadeInDuration;
    return _this;
  }

  _createClass(AudioSegment, [{
    key: 'copy',
    value: function copy(audioSegment) {
      _get(Object.getPrototypeOf(AudioSegment.prototype), 'copy', this).call(this, audioSegment);

      this.volume = audioSegment.volume;
      this.fadeInDuration = audioSegment.fadeInDuration;
      this.fadeOutDuration = audioSegment.fadeOutDuration;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new AudioSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setVolume',
    value: function setVolume(volume) {
      this.volume = volume;

      this.notifyChangeHandlers('volume', volume);

      return this;
    }
  }, {
    key: 'setFadeDuration',
    value: function setFadeDuration(fadeDuration) {
      return this.setFadeInDuration(fadeDuration).setFadeOutDuration(fadeDuration);
    }
  }, {
    key: 'setFadeInDuration',
    value: function setFadeInDuration(fadeInDuration) {
      this.fadeInDuration = fadeInDuration;

      return this;
    }
  }, {
    key: 'setFadeOutDuration',
    value: function setFadeOutDuration(fadeOutDuration) {
      this.fadeOutDuration = fadeOutDuration;

      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'audio - ' + this.filename;
    }
  }]);

  return AudioSegment;
}(MediaSegment);