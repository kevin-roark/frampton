#!/usr/local/bin/node --harmony_default_parameters
'use strict';

var fs = require('fs');
var frameAnalysis = require('../analysis/frame-analysis');

(function () {
  var args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('need a video to analyze...');
    return;
  }

  var video = args[0];
  var outFile = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : 'frampton.frames.json';
  var removeImages = args.indexOf('--keep-images') < 0;
  var scaleImages = args.indexOf('--no-scale') < 0;

  frameAnalysis.analyzeVideoFrames(video, { removeImages: removeImages, scaleImages: scaleImages }, function (frameData) {
    fs.writeFileSync(outFile, JSON.stringify(frameData));

    console.log('analyzed frames of ' + video + ' written to ' + outFile);
  });
})();