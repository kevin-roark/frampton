
var Segment = require('./segment');

module.exports = class SequencedSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'sequence';
    this.segments = options.segments || [];
  }
};
