
var Segment = require('./segment');

module.exports = class TextSegment extends Segment {
  constructor(options) {
    super(options);

    this.segmentType = 'text';

    this.text = options.text || '';
    this.duration = options.duration || 5;
    this.font = options.font || 'Times New Roman';
    this.fontSize = options.fontSize || '24px';
    this.textAlignment = options.textAlignment || 'left';
    this.color = options.color || 'black';
    this.top = options.top;
    this.left = options.left;
    this.maxWidth = options.maxWidth;
    this.z = options.z || 0;
    this.opacity = options.opacity || 1.0;
  }

  copy(textSegment) {
    super.copy(textSegment);

    this.text = textSegment.text;
    this.duration = textSegment.duration;
    this.font = textSegment.font;
    this.fontSize = textSegment.fontSize;
    this.textAlignment = textSegment.textAlignment;
    this.color = textSegment.color;
    this.top = textSegment.top;
    this.left = textSegment.left;
    this.maxWidth = textSegment.maxWidth;
    this.z = textSegment.z;
    this.opacity = textSegment.opacity;

    return this;
  }

  clone() {
    return new TextSegment({}).copy(this);
  }

  // Chaining Configuration

  setText(text) {
    this.text = text;
    return this;
  }

  setDuration(duration) {
    this.duration = duration;
    return this;
  }

  setFont(font) {
    this.font = font;
    return this;
  }

  setFontSize(fontSize) {
    this.fontSize = fontSize;
    return this;
  }

  setTextAlignment(textAlignment) {
    this.textAlignment = textAlignment;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setTop(top) {
    this.top = top;
    return this;
  }

  setLeft(left) {
    this.left = left;
    return this;
  }

  setMaxWidth(maxWidth) {
    this.maxWidth = maxWidth;
    return this;
  }

  // Generators

  getDuration() {
    return this.duration;
  }

};
