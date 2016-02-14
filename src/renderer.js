
var SequencedSegment = require('./sequenced-segment');

module.exports = class Renderer {
  constructor(options) {
    this.mediaConfig = options.mediaConfig;
    this.outputFilepath = options.outputFilepath !== undefined ? options.outputFilepath : './out/';
  }

  renderSegment(segment, options) {
    switch (segment.segmentType) {
      case 'sequence':
        this.renderSequencedSegment(segment, options);
        break;

      case 'video':
        this.renderVideoSegment(segment, options);
        break;

      default:
        console.log('unhandled sequence type: ' + segment.segmentType);
        break;
    }
  }

  renderSequencedSegment() {}
  renderVideoSegment() {}
};
