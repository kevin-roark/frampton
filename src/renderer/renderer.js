
module.exports = class Renderer {
  constructor(options) {
    this.mediaConfig = options.mediaConfig;
    this.outputFilepath = options.outputFilepath !== undefined ? options.outputFilepath : './out/';
    this.log = options.log || false;

    if (this.log) {
      console.log('frampton is starting now...');
    }
  }

  /// Rendering

  scheduleSegmentRender(segment, offset) {}
  renderVideoSegment() {}

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

  renderSequencedSegment(sequenceSegment, {offset=0}) {
    sequenceSegment.segments.forEach((segment, idx) => {
      this.scheduleSegmentRender(segment, offset);
      offset += segment.msDuration();

      if (idx === 0) {
        this.overrideOnStart(segment, () => {
          sequenceSegment.didStart();
        });
      }
      else if (idx === sequenceSegment.segmentCount() - 1) {
        this.overrideOnComplete(segment, () => {
          sequenceSegment.cleanup();
        });
      }
    });
  }

  renderStackedSegment(stackedSegment, {offset=0}) {
    stackedSegment.segments.forEach((segment, idx) => {
      var segmentOffset = offset + stackedSegment.msSegmentOffset(idx);
      this.scheduleSegmentRender(segment, segmentOffset);

      if (idx === 0) {
        this.overrideOnStart(segment, () => {
          stackedSegment.didStart();
        });
      }
    });

    var lastSegment = stackedSegment.lastSegment();
    this.overrideOnComplete(lastSegment, () => {
      stackedSegment.cleanup();
    });
  }

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
