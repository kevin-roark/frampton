
export class Segment {
  constructor({loop, onComplete}) {
    this.loop = loop !== undefined ? loop : false;
    this.onComplete = onComplete;
  }
}
