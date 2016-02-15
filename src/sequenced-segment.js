
var Segment = require('./segment');

module.exports = class SequencedSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'sequence';
    this.segments = options.segments || [];
  }

  copy(sequencedSegment, recursive) {
    super.copy(sequencedSegment);

    this.segments = [];
    for (var i = 0; i < sequencedSegment.segments.length; i++) {
      var segment = sequencedSegment.segments[i];
      this.segments.push(recursive ? segment.clone() : segment);
    }

    return this;
  }

  clone() {
    return new SequencedSegment({}).copy(this);
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
