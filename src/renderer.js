
var SequencedSegment = require('./sequenced-segment');

module.exports = class Renderer {
  constructor(options) {
    this.mediaFilepath = options.mediaFilepath;
    this.outputFilepath = options.outputFilepath !== undefined ? options.outputFilepath : './out/';

    let segment = options.segment;
    switch (segment.segmentType) {
      case 'video':
        this.segment = new SequencedSegment({segments: [segment], loop: segment.loop});
        break;
      case 'sequence':
        this.segment = segment;
        break;
      default:
        console.log('broken home.... uknown segment type');
        break;
    }
  }

  render() {

  }
};
