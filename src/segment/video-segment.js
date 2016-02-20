
var Segment = require('./segment');

module.exports = class VideoSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'video';

    // inherent to video
    this.filename = options.filename;
    this.videoDuration = options.duration;

    // segment configuration
    this.startTime = options.startTime || 0;
    this.duration = this.videoDuration - this.startTime;
    this.loop = options.loop || false;
    this.z = options.z || 0;
    this.width = options.width;
    this.top = options.top;
    this.left = options.left;
  }

  copy(videoSegment) {
    super.copy(videoSegment);

    this.filename = videoSegment.filename;
    this.videoDuration = videoSegment.duration;
    this.startTime = videoSegment.startTime;
    this.duration = videoSegment.duration;
    this.loop = videoSegment.loop;
    this.z = videoSegment.z;
    this.width = videoSegment.width;
    this.left = videoSegment.left;
    this.top = videoSegment.top;

    return this;
  }

  clone() {
    return new VideoSegment({}).copy(this);
  }

  // Chaining Configuration

  setFilename(filename) {
    this.filename = filename;
    return this;
  }

  setEndTime(endTime) {
    this.startTime = endTime - this.duration;
    return this;
  }

  setStartTime(startTime) {
    this.startTime = startTime;
    this.duration = Math.min(this.duration, this.videoDuration - startTime);
    return this;
  }

  setDuration(duration, startAtEnd) {
    this.duration = Math.min(duration, this.videoDuration);

    var maximalStartTime = this.videoDuration - this.duration;
    if (startAtEnd || this.startTime > maximalStartTime) {
      this.startTime = maximalStartTime;
    }

    return this;
  }

  // Generators

  extensionlessName() {
    return this.filename.substring(0, this.filename.lastIndexOf('.'));
  }

  endTime() {
    return this.startTime + this.duration;
  }

  getDuration() {
    return this.duration;
  }

  msStartTime() {
    return this.startTime * 1000;
  }

  msEndTime() {
    return this.endTime() * 1000;
  }

};
