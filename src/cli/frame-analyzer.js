#!/usr/local/bin/node --harmony_default_parameters

var fs = require('fs');
var frameAnalysis = require('../analysis/frame-analysis');

(function() {
  var args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('need a video to analyze...');
    return;
  }

  var video = args[0];
  var outFile = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : 'frampton.frames.json';

  frameAnalysis.analyzeVideoFrames(video, {}, (frameData) => {
    fs.writeFileSync(outFile, JSON.stringify(frameData));

    console.log(`analyzed frames of ${video} written to ${outFile}`);
  });
})();
