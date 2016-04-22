#!/usr/local/bin/node
'use strict';

var ncp = require('ncp').ncp;
var fs = require('fs');
var jsonfile = require('jsonfile');
var browserify = require('browserify');
var babelify = require('babelify');
var uglifyify = require('uglifyify');

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
  var shouldUglify = args.indexOf('--nougly') === -1;
  var onlyCopyScore = args.indexOf('--onlyscore') >= 0;
  var allowAllBrowsers = args.indexOf('--allbrowsers') >= 0;

  var score = fs.readFileSync(scoreFilePath).toString().replace('frampton.Renderer', 'frampton.WebRenderer').replace('frampton.VideoRenderer', 'frampton.WebRenderer');

  var mainJS = '\n    (function() {\n      var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);\n      if (!isChrome && !' + allowAllBrowsers + ') {\n        console.log(\'only chrome is supported for now...\');\n        return;\n      }\n\n      var frampton = require(\'../../src/web-frampton\');\n      var mediaConfig = require(\'./media_config.json\');\n\n      ' + score + '\n    })();\n\n  ';

  var mediaConfig = jsonfile.readFileSync(mediaConfigFilepath);

  if (onlyCopyScore) {
    bundle();
  } else {
    // copy web template
    ncp(__dirname + '/../web-template', outputFilepath, function (err) {
      if (err) {
        return console.error(err);
      }

      if (mediaConfig.path && mediaConfig.path.length > 0) {
        // copy media
        ncp(mediaConfig.path, outputFilepath + '/media', function (err) {
          if (err) {
            return console.error(err);
          }

          bundle();
        });
      } else {
        bundle();
      }
    });
  }

  function bundle() {
    // modify and write config
    mediaConfig.path = 'media/';
    var tempConfigFilename = __dirname + '/media_config.json';
    fs.writeFileSync(tempConfigFilename, JSON.stringify(mediaConfig));

    // write temp main
    var tempMainFilename = __dirname + '/tempmain.js';
    fs.writeFileSync(tempMainFilename, mainJS);

    // bundle it up
    var bundler = browserify(tempMainFilename).transform(babelify, { presets: ['es2015'] });

    if (shouldUglify) {
      bundler.transform({ global: true }, uglifyify);
    }

    bundler.bundle().pipe(fs.createWriteStream(outputFilepath + '/js/build.js')).on('finish', function () {
      fs.unlinkSync(tempMainFilename);
      fs.unlinkSync(tempConfigFilename);
    });
  }
})();