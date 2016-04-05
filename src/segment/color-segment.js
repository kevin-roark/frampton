
var VisualSegment = require('./visual-segment');

module.exports = class ColorSegment extends VisualSegment {
  constructor(options) {
    super(options);

    this.segmentType = 'color';

    // TODO: abstract this into FramesSegment
    this.fps = options.fps;
    this.numberOfFrames = options.numberOfFrames;
    this.framesData = options.framesData;

    this.transitionBetweenColors = options.transitionBetweenColors || false;
  }

  copy(colorSegment) {
    super.copy(colorSegment);

    this.fps = colorSegment.fps;
    this.numberOfFrames = colorSegment.numberOfFrames;
    this.framesData = colorSegment.framesData;
    this.transitionBetweenColors = colorSegment.transitionBetweenColors;

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

  setFramesData(framesData) {
    this.framesData = framesData.frames ? framesData.frames : framesData;
    return this;
  }

  // Generators

  simpleName() {
    return `color - ${this.filename}`;
  }

  numberOfColors() {
    if (this.numberOfFrames) {
      return this.numberOfFrames;
    }

    return this.framesData ? this.framesData.length : 0;
  }

  getColor(index) {
    if (!this.framesData) {
      return null;
    }

    var colors = this.framesData[index].colors;
    return colors.dominant;
  }

  getPalette(index) {
    if (!this.framesData) {
      return null;
    }

    var colors = this.framesData[index].colors;
    return colors.palette;
  }

  rgb(color) {
    if (!color) return 'rgb(0, 0, 0)';

    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
  }

};
