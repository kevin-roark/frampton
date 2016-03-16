
var VisualSegment = require('./visual-segment');

module.exports = class VideoSegment extends VisualSegment {
  constructor(options) {
    super(options);

    this.segmentType = 'video';

    this.audioFadeDuration = options.audioFadeDuration || 0;
    this.videoFadeDuration = options.videoFadeDuration || 0;
  }

  copy(videoSegment) {
    super.copy(videoSegment);

    this.audioFadeDuration = videoSegment.audioFadeDuration;
    this.videoFadeDuration = videoSegment.videoFadeDuration;

    return this;
  }

  clone() {
    return new VideoSegment({}).copy(this);
  }

  // Chaining Configuration

  setAudioFadeDuration(audioFadeDuration) {
    this.audioFadeDuration = audioFadeDuration;
    return this;
  }

  setVideoFadeDuration(videoFadeDuration) {
    this.videoFadeDuration = videoFadeDuration;
    return this;
  }

  // Generators

  simpleName() {
    return `video - ${this.filename}`;
  }

};
