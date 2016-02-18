
var renderer = new frampton.WebRenderer({
  mediaConfig: mediaConfig
});

var firstSegment = newSequencedSegment();
renderer.scheduleSegmentRender(firstSegment, 1000);

function newSequencedSegment() {
  var segments = [];

  var videos = frampton.util.shuffle(mediaConfig.videos);
  videos.forEach((video) => {
    var segment = new frampton.VideoSegment(video);
    segments.push(segment);
  });

  var sequencedSegment = new frampton.SequencedSegment({
    segments: segments,
    onStart: () => {
      // once it starts, schedule the next loop with a new shuffle
      var newSegment = newSequencedSegment();
      var offset = sequencedSegment.msDuration();
      renderer.scheduleSegmentRender(newSegment, offset);
    }
  });

  return sequencedSegment;
}
