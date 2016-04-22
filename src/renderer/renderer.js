
module.exports = class Renderer {
  constructor(options) {
    this.mediaConfig = options.mediaConfig;
    this.outputFilepath = options.outputFilepath !== undefined ? options.outputFilepath : 'out/';
    this.log = options.log || false;
    this.audioFadeDuration = options.audioFadeDuration;
    this.videoFadeDuration = options.videoFadeDuration;

    if (this.log) {
      console.log('frampton is starting now...');
    }
  }

  /// Scheduling

  scheduleSegmentRender(segment, delay) {
    // override to provide concrete implementation of actual scheduling

    // this handles associated segments 4 u
    var associatedSegments = segment.associatedSegments();
    if (associatedSegments) {
      for (var i = 0; i < associatedSegments.length; i++) {
        var associatedOffset = delay + associatedSegments[i].offset * 1000;
        this.scheduleSegmentRender(associatedSegments[i].segment, associatedOffset);
      }
    }
  }

  insertScheduledUnit(scheduledUnit, units) {
    var insertionIndex = getInsertionIndex(units, scheduledUnit, compareScheduledUnits);
    units.splice(insertionIndex, 0, scheduledUnit);
  }

  /// Rendering

  renderVideoSegment() {}
  renderImageSegment() {}
  renderColorSegment() {}
  renderAudioSegment() {}
  renderTextSegment() {}

  renderSegment(segment, options={}) {
    switch (segment.segmentType) {
      case 'video':
        this.renderVideoSegment(segment, options);
        break;

      case 'image':
        this.renderImageSegment(segment, options);
        break;

      case 'color':
        this.renderColorSegment(segment, options);
        break;

      case 'audio':
        this.renderAudioSegment(segment, options);
        break;

      case 'text':
        this.renderTextSegment(segment, options);
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
      offset += (segment.msDuration() + sequenceSegment.msVideoOffset());

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

function compareScheduledUnits(scheduledUnitA, scheduledUnitB) {
  var offsetA = scheduledUnitA.offset || 0;
  var offsetB = scheduledUnitB.offset || 0;

  return offsetA - offsetB;
}

// binary search baby
function getInsertionIndex(arr, element, comparator) {
  if (arr.length === 0) {
    return 0;
  }

  var low = 0;
  var high = arr.length - 1;

  while (low <= high) {
    var mid = Math.floor((low + high) / 2);
    var compareValue = comparator(arr[mid], element);
    if (compareValue < 0) {
      low = mid + 1;
    }
    else if (compareValue > 0) {
      high = mid - 1;
    }
    else {
      return mid;
    }
  }

  return low;
}
