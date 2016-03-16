

var Segment = require('./segment');

/// abstract superclass for Video, Color, Image
module.exports = class VisualSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'visual';

    // media config
    this.filename = options.filename;
    this.videoDuration = options.duration;

    // segment config
    this.startTime = options.startTime || 0;
    this.duration = this.videoDuration - this.startTime;
    this.playbackRate = options.playbackRate || 1.0;
    this.loop = options.loop || false;
    this.z = options.z || 0;
    this.opacity = options.opacity || 1.0;
    this.width = options.width;
    this.top = options.top;
    this.left = options.left;
  }

  copy(visualSegment) {
    super.copy(visualSegment);

    this.filename = visualSegment.filename;
    this.videoDuration = visualSegment.videoDuration;
    this.startTime = visualSegment.startTime;
    this.duration = visualSegment.duration;
    this.playbackRate = visualSegment.playbackRate;
    this.loop = visualSegment.loop;
    this.z = visualSegment.z;
    this.opacity = visualSegment.opacity;
    this.width = visualSegment.width;
    this.left = visualSegment.left;
    this.top = visualSegment.top;

    return this;
  }

  clone() {
    return new VisualSegment({}).copy(this);
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
    return this.duration / this.playbackRate;
  }

  msStartTime() {
    return this.startTime * 1000;
  }

  msEndTime() {
    return this.endTime() * 1000;
  }

};
