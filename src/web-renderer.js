
var Renderer = require('./renderer');

module.exports = class WebRenderer extends Renderer {
  constructor(options) {
    super(options);

    this.domContainer = document.body;
  }

  update() {
    window.requestAnimationFrame(this.update.bind(this));


  }

  render() {
    console.log('frampton is starting now...');

    this.update(); // get the loop going
    this.renderSegment(this.segment); // render the primary segment
  }

  renderSegment(segment) {
    switch (segment.segmentType) {
      case 'sequence':
        this.renderSequencedSegment(segment);
        break;

      case 'video':
        this.renderVideoSegment(segment);
        break;

      default:
        console.log('unhandled sequence type: ' + segment.segmentType);
        break;
    }
  }

  renderSequencedSegment(sequenceSegment) {
    var sequenceIndex = 0;

    var renderNextSequence = () => {
      var segment = sequenceSegment.getSegment(sequenceIndex);

      var segmentOnComplete = segment.onComplete;
      segment.onComplete = () => {
        // call the original completion and reset that bad boy
        if (segmentOnComplete) {
          segmentOnComplete();
        }
        segment.onComplete = segmentOnComplete;

        sequenceIndex += 1;
        if (sequenceIndex < sequenceSegment.segmentCount()) {
          renderNextSequence();
        }
        else {
          if (sequenceSegment.loop) {
            this.renderSequencedSegment(sequenceSegment);
          }
          else {
            sequenceSegment.cleanup();
          }
        }
      };

      this.renderSegment(segment);
    };

    renderNextSequence();
  }

  renderVideoSegment(segment) {
    var video = document.createElement('video');
    video.preload = true;
    video.className = 'frampton-video';

    var filename = video.canPlayType('video/mp4').length > 0 ? segment.filename : segment.extensionlessName() + '.webm';
    video.src = this.mediaFilepath + filename;

    video.style.zIndex = segment.z;

    video.onended = function() {
      if (segment.loop) {
        video.currentTime = 0;
        video.play();
      }
      else {
        segment.cleanup();

        video.parentNode.removeChild(video);
        video.src = '';
      }
    };

    this.domContainer.appendChild(video);
    video.play();
  }
};
