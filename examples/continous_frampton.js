
var kt = require('kutility');
var frampton = require('frampton');

var mediaFilepath = './media/';

var videoIDs = kt.shuffle(frampton.util.videoIDsInPath(mediaFilepath));

var currentIDChoices = [];

var segments = [];
videoIDs.forEach(function(id) {
  var segment = new frampton.VideoSegment({
    mediaID: id,
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

var leaderSegment = new frampton.SequencedSegment({
  segments: segments,
  loop: true
});

var renderer = new frampton.WebRenderer({
  segment: leaderSegment,
  mediaFilepath: mediaFilepath
});

renderer.render();