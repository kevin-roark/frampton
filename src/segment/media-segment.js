
var Segment = require('./segment');

/// abstract superclass for VisualSegment, AudioSegment
/// Dynamic properties on web: playbackRate
module.exports = class MediaSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'media';

    // media config
    this.filename = options.filename;
    this.mediaDuration = options.duration;
    this.audioSampleRate = options.audioSampleRate || 44100;

    // segment config
    this.startTime = options.startTime || 0;
    this.duration = this.mediaDuration - this.startTime;
    this.playbackRate = options.playbackRate || 1.0;
    this.loop = options.loop || false;
  }

  copy(mediaSegment) {
    super.copy(mediaSegment);

    this.filename = mediaSegment.filename;
    this.mediaDuration = mediaSegment.mediaDuration;

    this.startTime = mediaSegment.startTime;
    this.duration = mediaSegment.duration;
    this.playbackRate = mediaSegment.playbackRate;
    this.loop = mediaSegment.loop;

    return this;
  }

  clone() {
    return new MediaSegment({}).copy(this);
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
    this.duration = Math.min(this.duration, this.mediaDuration - startTime);
    return this;
  }

  setDuration(duration, startAtEnd) {
    this.duration = Math.min(duration, this.mediaDuration);

    var maximalStartTime = this.mediaDuration - this.duration;
    if (startAtEnd || this.startTime > maximalStartTime) {
      this.startTime = maximalStartTime;
    }

    return this;
  }

  setPlaybackRate(playbackRate) {
    this.playbackRate = playbackRate;

    this.notifyChangeHandlers('playbackRate', playbackRate);

    return this;
  }

  setLoop(loop) {
    this.loop = loop;

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
