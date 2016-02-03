
var kt = require('kutility');
var frampton = require('frampton');

var mediaFilepath = './media/';

var videoIDs = kt.shuffle(frampton.util.videoIDsInPath(mediaFilepath));

var currentIDChoices = [];

var segments = [];
videoIDs.forEach(function(id) {
  var segment = new frampton.VideoSegment({
    id: id,
    onComplete: function() {
      // refill choices if necessary
      if (currentIDChoices.length === 0) {
        currentIDChoices = kt.shuffle(videoIDs);
      }

      var newID = currentIDChoices.shift();
      segment.setMediaID(newID);
    }
  });

  segments.push(segment);
});

var leaderSegment = new frampton.Segment({
  childSegments: segments,
  loop: true
});

var renderer = new frampton.Renderer({
  segment: leaderSegment,
  mediaFilepath: mediaFilepath
});

renderer.render();
