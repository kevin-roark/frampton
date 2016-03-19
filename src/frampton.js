
module.exports = {
  Segment: require('./segment/segment'),
  VideoSegment: require('./segment/video-segment'),
  ColorSegment: require('./segment/color-segment'),
  AudioSegment: require('./segment/audio-segment'),

  SequencedSegment: require('./segment/sequenced-segment'),
  StackedSegment: require('./segment/stacked-segment'),
  finiteLoopingSegment: require('./segment/finite-looping-segment'),

  Renderer: require('./renderer/renderer'),
  VideoRenderer: require('./renderer/video-renderer'),

  Tagger: require('./tagger'),
  mediaArranger: require('./media-arranger'),
  util: require('./util')
};
