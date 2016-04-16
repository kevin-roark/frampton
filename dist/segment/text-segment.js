'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

module.exports = function (_Segment) {
  _inherits(TextSegment, _Segment);

  function TextSegment(options) {
    _classCallCheck(this, TextSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TextSegment).call(this, options));

    _this.segmentType = 'text';

    _this.text = options.text || '';
    _this.duration = options.duration || 5;
    _this.font = options.font || 'Times New Roman';
    _this.fontSize = options.fontSize || '24px';
    _this.textAlignment = options.textAlignment || 'left';
    _this.color = options.color || 'black';
    _this.top = options.top;
    _this.left = options.left;
    _this.maxWidth = options.maxWidth;
    _this.z = options.z || 0;
    _this.opacity = options.opacity || 1.0;
    return _this;
  }

  _createClass(TextSegment, [{
    key: 'copy',
    value: function copy(textSegment) {
      _get(Object.getPrototypeOf(TextSegment.prototype), 'copy', this).call(this, textSegment);

      this.text = textSegment.text;
      this.duration = textSegment.duration;
      this.font = textSegment.font;
      this.fontSize = textSegment.fontSize;
      this.textAlignment = textSegment.textAlignment;
      this.color = textSegment.color;
      this.top = textSegment.top;
      this.left = textSegment.left;
      this.maxWidth = textSegment.maxWidth;
      this.z = textSegment.z;
      this.opacity = textSegment.opacity;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new TextSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setText',
    value: function setText(text) {
      this.text = text;
      return this;
    }
  }, {
    key: 'setDuration',
    value: function setDuration(duration) {
      this.duration = duration;
      return this;
    }
  }, {
    key: 'setFont',
    value: function setFont(font) {
      this.font = font;
      return this;
    }
  }, {
    key: 'setFontSize',
    value: function setFontSize(fontSize) {
      this.fontSize = fontSize;
      return this;
    }
  }, {
    key: 'setTextAlignment',
    value: function setTextAlignment(textAlignment) {
      this.textAlignment = textAlignment;
      return this;
    }
  }, {
    key: 'setColor',
    value: function setColor(color) {
      this.color = color;
      return this;
    }
  }, {
    key: 'setTop',
    value: function setTop(top) {
      this.top = top;
      return this;
    }
  }, {
    key: 'setLeft',
    value: function setLeft(left) {
      this.left = left;
      return this;
    }
  }, {
    key: 'setMaxWidth',
    value: function setMaxWidth(maxWidth) {
      this.maxWidth = maxWidth;
      return this;
    }

    // Generators

  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.duration;
    }
  }]);

  return TextSegment;
}(Segment);