
module.exports = class Segment {
  constructor (options) {
    this.onStart = options.onStart;
    this.onComplete = options.onComplete;

    this.changeHandlers = {};
  }

  copy (segment) {
    this.onStart = segment.onStart;
    this.onComplete = segment.onComplete;

    return this;
  }

  clone () {
    return new Segment({}).copy(this);
  }

  /// Start and Finish

  didStart () {
    if (this.onStart) {
      this.onStart();
      this.onStart = undefined;
    }
  }

  cleanup () {
    if (this.onComplete) {
      this.onComplete();
      this.onComplete = undefined;
    }
  }

  /// Chaining Configuration

  setOnStart (onStart) {
    this.onStart = onStart;
    return this;
  }

  setOnComplete (onComplete) {
    this.onComplete = onComplete;
    return this;
  }

  /// Change Notification

  addChangeHandler (propertyName, fn) {
    var handlers = this.getChangeHandlers(propertyName);
    handlers.push(fn);
  }

  notifyChangeHandlers (propertyName, value) {
    var handlers = this.getChangeHandlers(propertyName);

    for (var i = 0; i < handlers.length; i++) {
      handlers[i](value);
    }
  }

  getChangeHandlers (propertyName) {
    var handlers = this.changeHandlers[propertyName];
    if (handlers !== undefined) {
      return handlers;
    }

    handlers = [];
    this.changeHandlers[propertyName] = handlers;

    return handlers;
  }

  /// Generators

  getDuration () {
    return 0;
  }

  msDuration () {
    return this.getDuration() * 1000;
  }

  simpleName () {
    return 'plain segment';
  }

  associatedSegments () {
    return null;
  }

};
