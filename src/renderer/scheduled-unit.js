
module.exports = class ScheduledUnit {
  constructor(segment, offset) {
    this.segment = segment;
    this.offset = offset;
  }

  toString() {
    return `${Math.round(this.offset * 100) / 100}: ${this.segment.simpleName()} for ${this.segment.getDuration()}`;
  }
};
