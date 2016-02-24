
module.exports = class Renderer {
  constructor(options) {
    this.mediaConfig = options.mediaConfig;
    this.outputFilepath = options.outputFilepath !== undefined ? options.outputFilepath : './out/';
  }

  /// Rendering

  renderSegment(segment, options={}) {
    switch (segment.segmentType) {
      case 'video':
        this.renderVideoSegment(segment, options);
        break;

      case 'sequence':
        this.renderSequencedSegment(segment, options);
        break;

      case 'stacked':
        this.renderStackedSegment(segment, options);
        break;

      default:
        console.log('unhandled sequence type: ' + segment.segmentType);
        break;
    }
  }

  renderVideoSegment() {}
  renderSequencedSegment() {}
  renderStackedSegment() {}

  /// Utility

  overrideOnStart(segment, onStart) {
    var originalOnStart = segment.onStart;
    segment.onStart = () => {
      // call and reset the original
      if (originalOnStart) {
        originalOnStart();
      }
      segment.onStart = originalOnStart;

      // call the new one
      onStart();
    };
  }

  overrideOnComplete(segment, onComplete) {
    var originalOnComplete = segment.onComplete;
    segment.onComplete = () => {
      // call and reset the original
      if (originalOnComplete) {
        originalOnComplete();
      }
      segment.onComplete = originalOnComplete;

      // call the new one
      onComplete();
    };
  }
};
