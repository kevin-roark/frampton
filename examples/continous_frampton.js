
var videos = frampton.util.shuffle(mediaConfig.videos);
var currentVideoChoices = [];

var segments = [];
videos.forEach(function(video) {
  var segment = new frampton.VideoSegment({
    mediaID: video.id,
    onComplete: function() {
      // refill choices if necessary
      if (currentVideoChoices.length === 0) {
        currentVideoChoices = frampton.util.shuffle(videos);
      }

      var newVideo = currentVideoChoices.shift();
      segment.setMediaID(newVideo.id);
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
