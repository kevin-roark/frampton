
var renderer = new frampton.WebRenderer({
  mediaConfig: mediaConfig
});

var firstSegment = newSequencedSegment();
renderer.renderSegment(firstSegment);

function newSequencedSegment() {
  var segments = [];

  var videos = frampton.util.shuffle(mediaConfig.videos);
  videos.forEach((video) => {
    var segment = new frampton.VideoSegment(video);
    segments.push(segment);
  });

  var sequencedSegment = new frampton.SequencedSegment({
    segments: segments
  });

  segments[0].onComplete = () => {
    // after the first clip completes, schedule the next loop of with a new shuffle
    var newSegment = newSequencedSegment();
    var offset = (sequencedSegment.totalDuration() - sequencedSegment.getSegment(0).duration) * 1000;
    renderer.scheduleSegmentRender(newSegment, offset);
  };

  return sequencedSegment;
}
