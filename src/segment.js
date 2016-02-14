
module.exports = class Segment {
  constructor(options) {
    this.loop = options.loop !== undefined ? options.loop : false;
    this.onComplete = options.onComplete;
  }

  cleanup() {
    if (this.onComplete) {
      this.onComplete();
    }
  }

};
