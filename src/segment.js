
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

  didStart() {
    if (this.onStart) {
      this.onStart();
    }
  }

  cleanup() {
    if (this.onComplete) {
      this.onComplete();
    }
  }

};
