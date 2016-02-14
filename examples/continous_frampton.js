
var videos = frampton.util.shuffle(mediaConfig.videos);
var currentVideoChoices = [];

var segments = [];
videos.forEach(function(video) {
  var segment = new frampton.VideoSegment({
    filename: video.filename,
    onComplete: function() {
      // refill choices if necessary
      if (currentVideoChoices.length === 0) {
        currentVideoChoices = frampton.util.shuffle(videos);
      }

      var newVideo = currentVideoChoices.shift();
      segment.setMediaID(newVideo.filename);
    }
  });

  segments.push(segment);
});

var leaderSegment = new frampton.SequencedSegment({
  segments: segments,
  loop: true
});

var renderer = new frampton.WebRenderer({
  segment: leaderSegment,
  mediaFilepath: mediaConfig.path
});

renderer.render();
