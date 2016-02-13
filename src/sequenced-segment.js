
import { Segment } from './segment';

export class SequencedSegment extends Segment {
  constructor(options) {
    super(options);

    this.segments = options.segments || [];
  }
}
