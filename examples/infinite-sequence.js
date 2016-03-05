
var renderer = new frampton.Renderer({
  mediaConfig: mediaConfig
});

var firstSegment = newSequencedSegment();
renderer.scheduleSegmentRender(firstSegment, 1000);

function newSequencedSegment() {
  var segments = [];

  mediaConfig.videos.forEach((video) => {
    var segment = new frampton.VideoSegment(video);
    segments.push(segment);
  });

  var sequencedSegment = new frampton.SequencedSegment({
    segments: segments,
    onStart: () => {
      // once it starts, schedule the next loop
      var newSegment = newSequencedSegment();
      var offset = sequencedSegment.msDuration();
      renderer.scheduleSegmentRender(newSegment, offset);
    }
  });

  return sequencedSegment;
}
