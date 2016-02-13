
var Segment = require('./segment');

module.exports = class VideoSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'video';
    this.mediaID = options.mediaID;
  }
};
