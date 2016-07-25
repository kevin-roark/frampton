'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

// Image Sequences baby
/// Dynamic properties on web: opacity, z, rect, fps
module.exports = function (_Segment) {
  _inherits(ImageSegment, _Segment);

  function ImageSegment(options) {
    _classCallCheck(this, ImageSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageSegment).call(this, options));

    _this.segmentType = 'image';
    _this.images = options.images || [];
    _this.fps = options.fps || 30;
    _this.duration = _this.images.length / _this.fps;
    _this.loop = options.loop !== undefined ? options.loop : false;
    _this.rect = options.rect || { x: 0, y: 0, w: 1, h: 1 };
    _this.z = options.z || 0;
    _this.opacity = options.opacity || 1.0;
    return _this;
  }

  _createClass(ImageSegment, [{
    key: 'copy',
    value: function copy(imageSegment) {
      _get(Object.getPrototypeOf(ImageSegment.prototype), 'copy', this).call(this, imageSegment);

      this.images = imageSegment.images;
      this.fps = imageSegment.fps;
      this.duration = imageSegment.duration;
      this.loop = imageSegment.loop;
      this.rect = imageSegment.rect;
      this.z = imageSegment.z;
      this.opacity = imageSegment.opacity;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new ImageSegment({}).copy(this);
    }

    // Chaining Setters

  }, {
    key: 'setImages',
    value: function setImages(images) {
      this.images = images;
      this.duration = this.frameCount() / this.fps;
      return this;
    }
  }, {
    key: 'setFPS',
    value: function setFPS(fps) {
      this.fps = fps;
      this.duration = this.frameCount() / fps;
      this.notifyChangeHandlers('fps', fps);
      return this;
    }
  }, {
    key: 'setDuration',
    value: function setDuration(duration) {
      this.duration = duration;
      this.fps = this.frameCount() / duration;
      this.notifyChangeHandlers('fps', this.fps);
      return this;
    }
  }, {
    key: 'setLoop',
    value: function setLoop(loop) {
      this.loop = loop;
      return this;
    }
  }, {
    key: 'setOpacity',
    value: function setOpacity(opacity) {
      this.opacity = opacity;
      this.notifyChangeHandlers('opacity', opacity);
      return this;
    }
  }, {
    key: 'setRect',
    value: function setRect(rect) {
      this.rect = rect;
      this.notifyChangeHandlers('rect', rect);
      return this;
    }
  }, {
    key: 'setZ',
    value: function setZ(z) {
      this.z = z;
      this.notifyChangeHandlers('z', z);
      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      var filenames = this.images.slice(0, 3).map(function (i) {
        return i.filename;
      });
      return 'image sequence - ' + filenames.join(',') + '...';
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.duration;
    }
  }, {
    key: 'frameCount',
    value: function frameCount() {
      return this.images.length;
    }
  }, {
    key: 'getFilename',
    value: function getFilename(idx) {
      if (idx < 0 || idx >= this.images.length) return null;
      return this.images[idx].filename;
    }
  }, {
    key: 'msPerFrame',
    value: function msPerFrame() {
      var secondsPerFrame = this.fps / 1;
      return secondsPerFrame * 1000;
    }
  }]);

  return ImageSegment;
}(Segment);