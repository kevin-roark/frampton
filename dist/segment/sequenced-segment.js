'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

module.exports = function (_Segment) {
  _inherits(SequencedSegment, _Segment);

  function SequencedSegment() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SequencedSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SequencedSegment).call(this, options));

    _this.segmentType = 'sequence';
    _this.segments = options.segments || [];
    _this.videoOffset = options.videoOffset || 0;
    return _this;
  }

  _createClass(SequencedSegment, [{
    key: 'copy',
    value: function copy(sequencedSegment, recursive) {
      _get(Object.getPrototypeOf(SequencedSegment.prototype), 'copy', this).call(this, sequencedSegment);

      this.segments = [];
      for (var i = 0; i < sequencedSegment.segments.length; i++) {
        var segment = sequencedSegment.segments[i];
        this.segments.push(recursive ? segment.clone() : segment);
      }

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new SequencedSegment().copy(this, true);
    }

    /// Generators

  }, {
    key: 'getSegment',
    value: function getSegment(index) {
      return this.segments[index];
    }
  }, {
    key: 'segmentCount',
    value: function segmentCount() {
      return this.segments.length;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      var offset = 0;
      for (var i = 0; i < this.segments.length - 1; i++) {
        offset += this.segments[i].getDuration() - this.videoOffset;
      }

      var duration = offset + this.segments[this.segments.length - 1].getDuration();

      return duration;
    }
  }, {
    key: 'msVideoOffset',
    value: function msVideoOffset() {
      return this.videoOffset * 1000;
    }
  }]);

  return SequencedSegment;
}(Segment);