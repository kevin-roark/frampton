
var VisualSegment = require('./visual-segment');
var AudioSegment = require('./audio-segment');

module.exports = class VideoSegment extends VisualSegment {
  constructor(options) {
    super(options);

    this.segmentType = 'video';

    this.audioFadeDuration = options.audioFadeDuration || 0;
    this.videoFadeDuration = options.videoFadeDuration || 0;

    this.audioHandleMedia = options.audioHandleMedia;
    this.audioHandleSegmentOptions = options.audioHandleSegmentOptions || {};
    this.audioHandleFadeDuration = options.audioHandleFadeDuration || 0.25;
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

  associatedSegments() {
    if (!this.audioHandleMedia) {
      return null;
    }

    var audioHandleOptions = this.audioHandleSegmentOptions;
    for (var key in this.audioHandleMedia) {
      if (this.audioHandleMedia.hasOwnProperty(key)) {
        audioHandleOptions[key] = this.audioHandleMedia[key];
      }
    }

    var audioHandleSegment = new AudioSegment(audioHandleOptions);
    if (this.getDuration() !== this.videoDuration) {
      audioHandleSegment.setDuration(this.getDuration() + this.audioHandleFadeDuration * 2);
    }
    audioHandleSegment
      .setStartTime(this.startTime)
      .setPlaybackRate(this.playbackRate)
      .setLoop(this.loop);

    return [{
      segment: audioHandleSegment,
      offset: -this.audioHandleFadeDuration
    }];
  }

};
