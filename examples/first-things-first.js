
var renderer = new frampton.Renderer({
  mediaConfig: mediaConfig,
  log: true
});

var indexSortedVideos = [];
var maxScenes = 4;
var tagger = new frampton.Tagger(mediaConfig);
var finder = new frampton.MediaFinder(mediaConfig);

for (var idx = 1; idx <= maxScenes; idx++) {
  var pattern = '/' + idx.toString() + '-';
  tagger.tagVideosWithPattern(pattern, pattern);

  var videos = frampton.mediaArranger.naturalLanguageSortedMedia(tagger.videosWithTag(pattern));
  indexSortedVideos.push(videos);
}

var segments = [];

var shotIndex = 0;
var hasMoreShots = true;
while (hasMoreShots) {
  hasMoreShots = false;

  for (var sceneIndex = 0; sceneIndex < indexSortedVideos.length; sceneIndex++) {
    var sceneShots = indexSortedVideos[sceneIndex];
    if (shotIndex < sceneShots.length) {
      var shot = sceneShots[shotIndex];
      var segment = new frampton.VideoSegment(shot);

      if (shotIndex > 1 && shotIndex < sceneShots.length - 1) {
        var audioHandleMedia = finder.findAudioHandleForVideo(shot);
        if (audioHandleMedia) {
          segment.setAudioHandleMedia(audioHandleMedia).setAudioHandleFadeDuration(0.25).setAudioHandleStartTimeOffset(0.75);
        }
      }

      segments.push(segment);
      hasMoreShots = true;
    }
  }

  shotIndex += 1;
}

var sequencedSegment = new frampton.SequencedSegment({
  segments: segments
});

renderer.scheduleSegmentRender(sequencedSegment, 2000);
