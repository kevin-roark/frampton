
var renderer = new frampton.Renderer({
  mediaConfig: mediaConfig
});

var orders = [
  [0, 1, 2],
  [2, 1, 0],
  [2, 0, 1],
  [1, 0, 2]
];

var durations = [0.5, 0.75, 1];

var durationScalar = 1.0;

var sequenceIndex = 0;
createTopLevelSequence(500);

function createTopLevelSequence (delay) {
  var order = orders[1];

  var segments = [];
  for (var i = 0; i < order.length; i++) {
    var video = mediaConfig.videos[order[i]];
    var segment = new frampton.VideoSegment(video);
    segment.setDuration(durations[i] * durationScalar);
    console.log('my duration: ' + segment.getDuration());

    segments.push(segment);
  }

  var sequence = new frampton.SequencedSegment({
    segments: segments
  });

  var loopingSequence = frampton.finiteLoopingSegment(sequence, 3);
  loopingSequence.setOnStart(function () {
    modifyDurationScaler(sequenceIndex);

    createTopLevelSequence(loopingSequence.msDuration());
  });

  renderer.scheduleSegmentRender(loopingSequence, delay);
  sequenceIndex += 1;
}

function modifyDurationScaler (idx) {
  durationScalar *= 0.8;

  // more complicated ideas

  // if (idx < 10) {
  //   // do something
  // } else if (idx === 11) {
  //   // do something
  // }
}
