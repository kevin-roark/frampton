#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var colorAnalysis = require('../analysis/color-analysis');

var args = process.argv.slice(2);

if (args.length === 0) {
  console.log('need a video to colorize...');
  return;
}

var video = args[0];
var outFile = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : path.join(process.cwd(), 'frampton-colors.json');

var colors = colorAnalysis.getVideoColors(video, {format: 'array'});

fs.writeFileSync(outFile, JSON.stringify(colors));

console.log(`colors of ${video} written to ${outFile}`);
