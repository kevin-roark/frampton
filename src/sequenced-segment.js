
var Segment = require('./segment');

module.exports = class SequencedSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'sequence';
    this.segments = options.segments || [];
  }

  getSegment(index) {
    return this.segments[index];
  }

  segmentCount() {
    return this.segments.length;
  }

  totalDuration() {
    var duration = 0;
    for (var i = 0; i < this.segments.length; i++) {
      duration += this.segments[i].duration;
    }
    return duration;
  }
};
