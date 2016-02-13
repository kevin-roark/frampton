
import { Segment } from './segment';

export class VideoSegment extends Segment {
  constructor(options) {
    this.segmentType = 'video';

    super(options);

    this.mediaID = options.mediaID;
  }
}
