#!/usr/local/bin/node

var fs = require('fs');
var colorAnalysis = require('../analysis/color-analysis');
var simpleAnalysis = require('../analysis/simple-analysis');

var args = process.argv.slice(2);

if (args.length === 0) {
  console.log('need a video to colorize...');
  return;
}

var video = args[0];
var outFile = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : 'frampton-colors.json';

var colors = colorAnalysis.getVideoColors(video);

var outJSON = {
  video: video,
  duration: simpleAnalysis.getVideoDuration(video),
  colors: colors
};

fs.writeFileSync(outFile, JSON.stringify(outJSON));

console.log(`colors of ${video} written to ${outFile}`);
