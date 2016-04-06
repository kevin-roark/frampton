'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualSegment = require('./visual-segment');

module.exports = function (_VisualSegment) {
  _inherits(ColorSegment, _VisualSegment);

  function ColorSegment(options) {
    _classCallCheck(this, ColorSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ColorSegment).call(this, options));

    _this.segmentType = 'color';

    // TODO: abstract this into FramesSegment
    _this.fps = options.fps;
    _this.numberOfFrames = options.numberOfFrames;
    _this.framesData = options.framesData;

    _this.transitionBetweenColors = options.transitionBetweenColors || false;
    return _this;
  }

  _createClass(ColorSegment, [{
    key: 'copy',
    value: function copy(colorSegment) {
      _get(Object.getPrototypeOf(ColorSegment.prototype), 'copy', this).call(this, colorSegment);

      this.fps = colorSegment.fps;
      this.numberOfFrames = colorSegment.numberOfFrames;
      this.framesData = colorSegment.framesData;
      this.transitionBetweenColors = colorSegment.transitionBetweenColors;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new ColorSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setColors',
    value: function setColors(colors) {
      this.colors = colors;
      return this;
    }
  }, {
    key: 'setFramesData',
    value: function setFramesData(framesData) {
      this.framesData = framesData.frames ? framesData.frames : framesData;
      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'color - ' + this.filename;
    }
  }, {
    key: 'numberOfColors',
    value: function numberOfColors() {
      if (this.numberOfFrames) {
        return this.numberOfFrames;
      }

      return this.framesData ? this.framesData.length : 0;
    }
  }, {
    key: 'getColor',
    value: function getColor(index) {
      if (!this.framesData) {
        return null;
      }

      var colors = this.framesData[index].colors;
      return colors.dominant;
    }
  }, {
    key: 'getPalette',
    value: function getPalette(index) {
      if (!this.framesData) {
        return null;
      }

      var colors = this.framesData[index].colors;
      return colors.palette;
    }
  }, {
    key: 'rgb',
    value: function rgb(color) {
      if (!color) return 'rgb(0, 0, 0)';

      return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
    }
  }]);

  return ColorSegment;
}(VisualSegment);