
var VisualSegment = require('./visual-segment');

module.exports = class ImageSegment extends VisualSegment {
  constructor(options) {
    super(options);

    this.segmentType = 'image';
  }

  copy(imageSegment) {
    super.copy(imageSegment);

    return this;
  }

  clone() {
    return new ImageSegment({}).copy(this);
  }

  // Generators

  simpleName() {
    return `image - ${this.filename}`;
  }

};
