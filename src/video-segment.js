
import { Segment } from './segment';

export class VideoSegment extends Segment {
  constructor(options) {
    super(options);

    this.mediaID = options.mediaID;
  }
}
