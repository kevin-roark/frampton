
var renderer = new frampton.Renderer({
  mediaConfig: mediaConfig
});

var colorSegmentOptions = {loop: true, transitionBetweenColors: false, playbackRate: 1};
var audioSegmentOptions = {loop: true, playbackRate: 1};

var color = frampton.util.choice(mediaConfig.colors);
for (var key in color) {
  if (color.hasOwnProperty(key)) {
    colorSegmentOptions[key] = color[key];
  }
}

var track = frampton.util.choice(mediaConfig.audio);
for (var key in track) {
  if (track.hasOwnProperty(key)) {
    audioSegmentOptions[key] = track[key];
  }
}

var colorSegment = new frampton.ColorSegment(colorSegmentOptions);
renderer.scheduleSegmentRender(colorSegment, 2000);

var audioSegment = new frampton.AudioSegment(audioSegmentOptions);
renderer.scheduleSegmentRender(audioSegment, 2000);

setTimeout(function() {
  colorSegment.setPlaybackRate(0.7);
  colorSegment.setOpacity(0.5);

  audioSegment.setPlaybackRate(0.7);
}, 6000);
