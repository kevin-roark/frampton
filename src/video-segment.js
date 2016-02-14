
var Segment = require('./segment');

module.exports = class VideoSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'video';
    this.filename = options.filename;
    this.z = options.z || 0;
  }

  extensionlessName() {
    return this.filename.substring(0, this.filename.indexOf('.'));
  }
};
