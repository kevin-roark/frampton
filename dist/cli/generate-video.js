#!/usr/local/bin/node
'use strict';

var fs = require('fs');
var spawn = require('child_process').spawn;

(function () {
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
  var outputFilepath = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : 'out';
  var renderedVideoName = args.indexOf('--outName') > 0 ? args[args.indexOf('--outName') + 1] : 'frampton-final.mp4';

  var score = fs.readFileSync(scoreFilePath).toString().replace('frampton.Renderer', 'frampton.VideoRenderer').replace('frampton.WebRenderer', 'frampton.VideoRenderer');

  var mainJS = '\n    (function() {\n      var frampton = require(\'../../src/video-frampton\');\n      var mediaConfig = require(\'./media_config.json\');\n      mediaConfig.__renderedVideoName = \'' + renderedVideoName + '\';\n\n      ' + score + '\n    })();\n\n  ';

  // temporarily write mediaConfig to current directory
  var tempConfigFilename = __dirname + '/media_config.json';
  fs.createReadStream(mediaConfigFilepath).pipe(fs.createWriteStream(tempConfigFilename));

  // write temp main
  var tempMainFilename = __dirname + '/tempmain.js';
  fs.writeFileSync(tempMainFilename, mainJS);

  // run the renderer
  var mainCommand = spawn('babel-node', ['--presets', 'es2015', '' + tempMainFilename]);

  mainCommand.stdout.on('data', function (data) {
    console.log(data.toString());
  });
  mainCommand.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  mainCommand.on('exit', function (code) {
    console.log('rendered with exit code ' + code);

    // clean up temporary files
    fs.unlinkSync(tempConfigFilename);
    fs.unlinkSync(tempMainFilename);
  });
})();