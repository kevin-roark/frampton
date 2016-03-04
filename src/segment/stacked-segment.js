
var Segment = require('./segment');

module.exports = class StackedSegment extends Segment {
  constructor(options={}) {
    super(options);

    this.segmentType = 'stacked';
    this.segments = options.segments || [];
    this.stackAllowance = options.stackAllowance || 0.25;
    this.segmentOffsets = [];
    this.segmentEndTimes = [];

    var accumulatedOffset = 0;
    for (var i = 0; i < this.segments.length; i++) {
      this.segmentOffsets.push(accumulatedOffset);

      var duration = this.segments[i].getDuration();
      this.segmentEndTimes.push(accumulatedOffset + duration);

      accumulatedOffset += (Math.random() * duration * this.stackAllowance * 2) + duration * (1 - this.stackAllowance);
    }
  }

  copy(stackedSegment, recursive) {
    super.copy(stackedSegment);

    this.stackAllowance = stackedSegment.stackAllowance;

    for (var i = 0; i < stackedSegment.segments.length; i++) {
      var segment = stackedSegment.segments[i];
      this.segments.push(recursive ? segment.clone() : segment);

      this.segmentOffsets.push(stackedSegment.segmentOffsets[i]);
      this.segmentEndTimes.push(stackedSegment.segmentEndTimes[i]);
    }

    return this;
  }

  clone() {
    return new StackedSegment().copy(this, true);
  }

  /// Generators

  msSegmentOffset(idx) {
    return this.segmentOffsets[idx] * 1000;
  }

  getDuration() {
    return Math.max.apply(null, this.segmentEndTimes);
  }

  lastSegment() {
    var maxEndTime = Math.max.apply(null, this.segmentEndTimes);
    var maxEndTimeIndex = this.segmentEndTimes.indexOf(maxEndTime) || this.segmentEndTimes.length - 1;
    return this.segments[maxEndTimeIndex];
  }

};
