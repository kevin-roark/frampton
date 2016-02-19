
var renderer = new frampton.WebRenderer({
  mediaConfig: mediaConfig
});

var firstSegment = newSequencedSegment();
renderer.scheduleSegmentRender(firstSegment, 1000);

function newSequencedSegment() {
  var videos = frampton.util.shuffle(mediaConfig.videos);

  // choose the number of videos in the group
  var numberOfVideos = frampton.util.choice([1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 10]);

  // calculate the minimum duration
  var minimumDuration = 10000;
  for (var i = 0; i < numberOfVideos; i++) {
    minimumDuration = Math.min(minimumDuration, videos[i].duration);
  }

  // choose the duration of each clip in the segment
  var segmentDuration = (Math.pow(Math.random(), 2.5) * (minimumDuration - 0.1)) + 0.1;

  // construct the ordered list of segments
  var segments = [];
  for (i = 0; i < numberOfVideos; i++) {
    var segment = new frampton.VideoSegment(videos[i]);
    segment.setDuration(segmentDuration);
    segments.push(segment);
  }

  // create the sequence from the ordered list
  var sequencedSegment = new frampton.SequencedSegment({
    segments: segments
  });

  // choose a number of times to loop sequence
  var timesToLoopSegment = frampton.util.choice([1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6]);

  var loopingSegment = frampton.finiteLoopingSegment(sequencedSegment, timesToLoopSegment, {
    onStart: () => {
      // once it starts, schedule the next loop with a new shuffle
      var newSegment = newSequencedSegment();
      var offset = loopingSegment.msDuration();
      renderer.scheduleSegmentRender(newSegment, offset);
    }
  });

  return loopingSegment;
}
