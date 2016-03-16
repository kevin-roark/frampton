
var renderer = new frampton.Renderer({
  mediaConfig: mediaConfig
});

var options = {
  loop: true,
  transitionBetweenColors: true,
  playbackRate: 1.0
};

var color = frampton.util.choice(mediaConfig.colors);

for (var key in color) {
  if (color.hasOwnProperty(key)) {
    options[key] = color[key];
  }
}

var colorSegment = new frampton.ColorSegment(options);
renderer.scheduleSegmentRender(colorSegment, 1000);
