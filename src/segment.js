
module.exports = class Segment {
  constructor(options) {
    this.onStart = options.onStart;
    this.onComplete = options.onComplete;
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
