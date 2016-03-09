
var Segment = require('./segment');

module.exports = class SequencedSegment extends Segment {
  constructor(options={}) {
    super(options);

    this.segmentType = 'sequence';
    this.segments = options.segments || [];
    this.videoOffset = options.videoOffset || 0;
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
    return new SequencedSegment().copy(this, true);
  }

  /// Generators

  getSegment(index) {
    return this.segments[index];
  }

  segmentCount() {
    return this.segments.length;
  }

  getDuration() {
    var offset = 0;
    for (var i = 0; i < this.segments.length - 1; i++) {
      offset += (this.segments[i].getDuration() - this.videoOffset);
    }

    var duration = offset + this.segments[this.segments.length - 1].getDuration();

    return duration;
  }

  msVideoOffset() {
    return this.videoOffset * 1000;
  }

};
