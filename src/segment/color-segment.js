
var VisualSegment = require('./visual-segment');

module.exports = class ColorSegment extends VisualSegment {
  constructor(options) {
    super(options);

    this.segmentType = 'color';

    this.colors = options.colors;
    this.transitionBetweenColors = options.transitionBetweenColors || false;
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

  numberOfColors() {
    return this.colors.length;
  }

  getColor(index) {
    return this.colors[index];
  }

  rgb(color) {
    if (!color) return 'rgb(0, 0, 0)';

    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
  }

  // Generators

  simpleName() {
    return `color - ${this.filename}`;
  }

};
