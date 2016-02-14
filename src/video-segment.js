
var Segment = require('./segment');

module.exports = class VideoSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'video';
    this.filename = options.filename;
    this.duration = options.duration || 0;
    this.loop = options.loop !== undefined ? options.loop : false;
    this.z = options.z || 0;
  }

  extensionlessName() {
    return this.filename.substring(0, this.filename.indexOf('.'));
  }

  setFilename(filename) {
    this.filename = filename;
  }

  msDuration() {
    return this.duration * 1000;
  }
};
