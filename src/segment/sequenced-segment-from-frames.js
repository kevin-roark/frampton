
var VideoSegment = require('./video-segment');
var SequencedSegment = require('./sequenced-segment');

module.exports = function sequencedSegmentFromFrames(framesData, options={}) {
  var firstFrameIndex = options.firstFrameIndex || 0;
  var numberOfFrames = options.numberOfFrames || framesData.frames.length;

  var frameDuration = 1 / framesData.fps;

  // create list of video segments, each segment with duration equal to one frame
  var segments = [];
  for (var i = firstFrameIndex; i < numberOfFrames; i++) {
    var frame = framesData.frames[i];

    var videoSegment = new VideoSegment(framesData);
    videoSegment
      .setStartTime(frame.timecode)
      .setDuration(frameDuration);

    segments.push(videoSegment);
  }

  // put segments in given options array to allow arbitrary options-passing to SequencedSegment
  options.segments = segments;

  // create the looping sequence segment
  var sequencedSegment = new SequencedSegment(options);

  return sequencedSegment;
};
