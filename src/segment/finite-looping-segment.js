
var SequencedSegment = require('./sequenced-segment');

module.exports = function finiteLoopingSegment(segment, timesToLoop=1, options={}) {
  // create the list of cloned segments to loop
  var clonedSegments = [];
  for (var i = 0; i < timesToLoop; i++) {
    clonedSegments.push(segment.clone());
  }

  options.segments = clonedSegments;

  // create the looping sequence segment
  var loopingSegment = new SequencedSegment(options);

  return loopingSegment;
};
