"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function ScheduledUnit(segment, offset) {
    _classCallCheck(this, ScheduledUnit);

    this.segment = segment;
    this.offset = offset;
  }

  _createClass(ScheduledUnit, [{
    key: "toString",
    value: function toString() {
      return Math.round(this.offset * 100) / 100 + ": " + this.segment.simpleName() + " for " + this.segment.getDuration();
    }
  }]);

  return ScheduledUnit;
}();