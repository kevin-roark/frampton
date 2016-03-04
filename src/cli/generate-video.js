#!/usr/local/bin/node

var fs = require('fs');
var exec = require('child_process').exec;

var args = process.argv.slice(2);
if (args.length < 1) {
  console.log('need a score...');
  return;
}
if (args.length < 2) {
  console.log('need a media config file...');
  return;
}

var scoreFilePath = args[0];
var mediaConfigFilepath = args[1];
var outputFilepath = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : './out';

var score = fs.readFileSync(scoreFilePath).toString()
            .replace('frampton.Renderer', 'frampton.VideoRenderer')
            .replace('frampton.WebRenderer', 'frampton.VideoRenderer');

var mainJS = `
  (function() {
    var frampton = require('../../src/frampton');
    var mediaConfig = require('./media_config.json');
    var outputFilepath = '${outputFilepath}';

    ${score}
  })();\n
`;

// temporarily write mediaConfig to current directory
var tempConfigFilename = __dirname + '/media_config.json';
fs.createReadStream(mediaConfigFilepath).pipe(fs.createWriteStream(tempConfigFilename));

// write temp main
var tempMainFilename = __dirname + '/tempmain.js';
fs.writeFileSync(tempMainFilename, mainJS);

// run the renderer
var mainCommand = `babel-node --presets es2015 ${tempMainFilename}`;
exec(mainCommand, (error, stdout, stderr) => {
  console.log(`videoRenderer stdout:\n${stdout}`);

  if (stderr) {
    console.log(`videoRenderer stderr:\n${stderr}`);
  }

  if (error) {
    console.log(`videoRenderer execution error:\n${error}`);
  }

  // clean up temporary files
  fs.unlinkSync(tempConfigFilename);
  fs.unlinkSync(tempMainFilename);
});
