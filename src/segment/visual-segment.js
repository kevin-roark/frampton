
var MediaSegment = require('./media-segment');

/// abstract superclass for Video, Color
/// Dynamic properties on web: opacity
module.exports = class VisualSegment extends MediaSegment {
  constructor (options) {
    super(options);

    this.segmentType = 'visual';

    this.z = options.z || 0;
    this.opacity = options.opacity || 1.0;
    this.width = options.width;
    this.top = options.top;
    this.left = options.left;
  }

  copy (visualSegment) {
    super.copy(visualSegment);

    this.z = visualSegment.z;
    this.opacity = visualSegment.opacity;
    this.width = visualSegment.width;
    this.left = visualSegment.left;
    this.top = visualSegment.top;

    return this;
  }

  clone () {
    return new VisualSegment({}).copy(this);
  }

  // Chaining Configuration

  setOpacity (opacity) {
    this.opacity = opacity;
    this.notifyChangeHandlers('opacity', opacity);
    return this;
  }

  setLeft (left) {
    this.left = left;
    this.notifyChangeHandlers('left', left);
    return this;
  }

  setTop (top) {
    this.top = top;
    this.notifyChangeHandlers('top', top);
    return this;
  }

  setWidth (width) {
    this.width = width;
    this.notifyChangeHandlers('width', width);
    return this;
  }

  setZ (z) {
    this.z = z;
    this.notifyChangeHandlers('z', z);
    return this;
  }

};
