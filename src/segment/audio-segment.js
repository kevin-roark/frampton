

var MediaSegment = require('./media-segment');

/// Play some audio!!
/// Dynamic properties on web: volume
module.exports = class AudioSegment extends MediaSegment {
  constructor(options) {
    super(options);

    this.segmentType = 'audio';

    this.volume = options.volume || 0.8;
  }

  copy(audioSegment) {
    super.copy(audioSegment);

    this.volume = audioSegment.volume;

    return this;
  }

  clone() {
    return new AudioSegment({}).copy(this);
  }

  // Chaining Configuration

  setVolume(volume) {
    this.volume = volume;

    this.notifyChangeHandlers('volume', volume);

    return this;
  }

};
