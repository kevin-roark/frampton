
import { Segment } from './segment';

export class VideoSegment extends Segment {
  constructor(options) {
    super(options);

    this.loop = options.loop !== undefined ? options.loop : false;
  }
}
