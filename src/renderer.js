
import { SequencedSegment } from './sequenced-segment';

export class Renderer {
  constructor({segment, mediaFilepath, outputFilepath}) {
    this.mediaFilepath = mediaFilepath;
    this.outputFilepath = outputFilepath !== undefined ? outputFilepath : './out/';

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
}
