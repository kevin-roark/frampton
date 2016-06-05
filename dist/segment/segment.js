'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Segment(options) {
    _classCallCheck(this, Segment);

    this.onStart = options.onStart;
    this.onComplete = options.onComplete;

    this.changeHandlers = {};
  }

  _createClass(Segment, [{
    key: 'copy',
    value: function copy(segment) {
      this.onStart = segment.onStart;
      this.onComplete = segment.onComplete;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new Segment({}).copy(this);
    }

    /// Start and Finish

  }, {
    key: 'didStart',
    value: function didStart() {
      if (this.onStart) {
        this.onStart();
        this.onStart = undefined;
      }
    }
  }, {
    key: 'cleanup',
    value: function cleanup() {
      if (this.onComplete) {
        this.onComplete();
        this.onComplete = undefined;
      }
    }

    /// Chaining Configuration

  }, {
    key: 'setOnStart',
    value: function setOnStart(onStart) {
      this.onStart = onStart;
      return this;
    }
  }, {
    key: 'setOnComplete',
    value: function setOnComplete(onComplete) {
      this.onComplete = onComplete;
      return this;
    }

    /// Change Notification

  }, {
    key: 'addChangeHandler',
    value: function addChangeHandler(propertyName, fn) {
      var handlers = this.getChangeHandlers(propertyName);
      handlers.push(fn);
    }
  }, {
    key: 'notifyChangeHandlers',
    value: function notifyChangeHandlers(propertyName, value) {
      var handlers = this.getChangeHandlers(propertyName);

      for (var i = 0; i < handlers.length; i++) {
        handlers[i](value);
      }
    }
  }, {
    key: 'getChangeHandlers',
    value: function getChangeHandlers(propertyName) {
      var handlers = this.changeHandlers[propertyName];
      if (handlers !== undefined) {
        return handlers;
      }

      handlers = [];
      this.changeHandlers[propertyName] = handlers;

      return handlers;
    }

    /// Generators

  }, {
    key: 'getDuration',
    value: function getDuration() {
      return 0;
    }
  }, {
    key: 'msDuration',
    value: function msDuration() {
      return this.getDuration() * 1000;
    }
  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'plain segment';
    }
  }, {
    key: 'associatedSegments',
    value: function associatedSegments() {
      return null;
    }
  }]);

  return Segment;
}();