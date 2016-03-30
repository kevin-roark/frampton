

var MediaSegment = require('./media-segment');

/// Play some audio!!
/// Dynamic properties on web: volume
module.exports = class AudioSegment extends MediaSegment {
  constructor(options) {
    super(options);

    this.segmentType = 'audio';

    this.volume = options.volume || 0.8;
    this.fadeInDuration = options.fadeInDuration;
    this.fadeOutDuration = options.fadeOutDuration || this.fadeInDuration;
  }

  copy(audioSegment) {
    super.copy(audioSegment);

    this.volume = audioSegment.volume;
    this.fadeInDuration = audioSegment.fadeInDuration;
    this.fadeOutDuration = audioSegment.fadeOutDuration;

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

  setFadeDuration(fadeDuration) {
    return this
      .setFadeInDuration(fadeDuration)
      .setFadeOutDuration(fadeDuration);
  }

  setFadeInDuration(fadeInDuration) {
    this.fadeInDuration = fadeInDuration;

    return this;
  }

  setFadeOutDuration(fadeOutDuration) {
    this.fadeOutDuration = fadeOutDuration;

    return this;
  }

  // Generators

  simpleName() {
    return `audio - ${this.filename}`;
  }

};
