
var renderer = new frampton.Renderer({
  mediaConfig: mediaConfig
});

var videos = frampton.util.shuffle(mediaConfig.videos);

for (var i = 0; i < 4; i++) {
  var video = videos[i];
  var segment = new frampton.VideoSegment({
    filename: video.filename,
    duration: video.duration,
    loop: true,
    width: '50%',
    left: i % 2 === 0 ? '0' : '50%',
    top: i < 2 ? '0' : '50%'
  });
  renderer.scheduleSegmentRender(segment, 1000 + 500 * i);
}
