
module.exports = class Segment {
  constructor(options) {
    this.onComplete = options.onComplete;
  }

  cleanup() {
    if (this.onComplete) {
      this.onComplete();
    }
  }

};
