
var Segment = require('./segment');

// Image Sequences baby
/// Dynamic properties on web: opacity, z, rect, fps
module.exports = class ImageSegment extends Segment {
  constructor (options) {
    super(options);

    this.segmentType = 'image';
    this.images = options.images || [];
    this.fps = options.fps || 30;
    this.duration = this.images.length / this.fps;
    this.loop = options.loop !== undefined ? options.loop : false;
    this.rect = options.rect || { x: 0, y: 0, w: 1, h: 1 };
    this.z = options.z || 0;
    this.opacity = options.opacity || 1.0;
  }

  copy (imageSegment) {
    super.copy(imageSegment);

    this.images = imageSegment.images;
    this.fps = imageSegment.fps;
    this.duration = imageSegment.duration;
    this.loop = imageSegment.loop;
    this.rect = imageSegment.rect;
    this.z = imageSegment.z;
    this.opacity = imageSegment.opacity;

    return this;
  }

  clone () {
    return new ImageSegment({}).copy(this);
  }

  // Chaining Setters

  setImages (images) {
    this.images = images;
    this.duration = this.frameCount() / this.fps;
    return this;
  }

  setFPS (fps) {
    this.fps = fps;
    this.duration = this.frameCount() / fps;
    this.notifyChangeHandlers('fps', fps);
    return this;
  }

  setDuration (duration) {
    this.duration = duration;
    this.fps = this.frameCount() / duration;
    this.notifyChangeHandlers('fps', this.fps);
    return this;
  }

  setLoop (loop) {
    this.loop = loop;
    return this;
  }

  setOpacity (opacity) {
    this.opacity = opacity;
    this.notifyChangeHandlers('opacity', opacity);
    return this;
  }

  setRect (rect) {
    this.rect = rect;
    this.notifyChangeHandlers('rect', rect);
    return this;
  }

  setZ (z) {
    this.z = z;
    this.notifyChangeHandlers('z', z);
    return this;
  }

  // Generators

  simpleName () {
    let filenames = this.images.slice(0, 3).map(i => i.filename);
    return `image sequence - ${filenames.join(',')}...`;
  }

  getDuration () {
    return this.duration;
  }

  frameCount () {
    return this.images.length;
  }

  getFilename (idx) {
    if (idx < 0 || idx >= this.images.length) return null;
    return this.images[idx].filename;
  }

  msPerFrame () {
    let secondsPerFrame = this.fps / 1;
    return secondsPerFrame * 1000;
  }

};
