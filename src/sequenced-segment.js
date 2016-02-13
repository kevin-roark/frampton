
import { Segment } from './segment';

export class SequencedSegment extends Segment {
  constructor(options) {
    this.segmentType = 'sequence';

    super(options);

    this.segments = options.segments || [];
  }
}
