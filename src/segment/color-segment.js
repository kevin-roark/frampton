
var VisualSegment = require('./visual-segment');

module.exports = class ColorSegment extends VisualSegment {
  constructor(options) {
    super(options);

    this.segmentType = 'color';

    this.colors = options.colors;
  }

  copy(colorSegment) {
    super.copy(colorSegment);

    this.colors = colorSegment.colors;

    return this;
  }

  clone() {
    return new ColorSegment({}).copy(this);
  }

  // Chaining Configuration

  setColors(colors) {
    this.colors = colors;
    return this;
  }

  // Generators

  simpleName() {
    return `color - ${this.filename}`;
  }

};
