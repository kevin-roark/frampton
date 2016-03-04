
module.exports = class Segment {
  constructor(options) {
    this.onStart = options.onStart;
    this.onComplete = options.onComplete;
  }

  copy(segment) {
    this.onStart = segment.onStart;
    this.onComplete = segment.onComplete;

    return this;
  }

  clone() {
    return new Segment({}).copy(this);
  }

  /// Start and Finish

  didStart() {
    if (this.onStart) {
      this.onStart();
      this.onStart = undefined;
    }
  }

  cleanup() {
    if (this.onComplete) {
      this.onComplete();
      this.onComplete = undefined;
    }
  }

  /// Generators

  getDuration() {
    return 0;
  }

  msDuration() {
    return this.getDuration() * 1000;
  }

};
