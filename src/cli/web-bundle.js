#!/usr/local/bin/node

var ncp = require('ncp').ncp;
var fs = require('fs');
var jsonfile = require('jsonfile');
var browserify = require('browserify');
var babelify = require('babelify');
var uglifyify = require('uglifyify');

(function() {
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

  var score = fs.readFileSync(scoreFilePath).toString()
              .replace('frampton.Renderer', 'frampton.WebRenderer')
              .replace('frampton.VideoRenderer', 'frampton.WebRenderer');

  var mainJS = `
    (function() {
      var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      if (!isChrome && !${allowAllBrowsers}) {
        console.log('only chrome is supported for now...');
        return;
      }

      var frampton = require('../../src/web-frampton');
      var mediaConfig = require('./media_config.json');

      ${score}
    })();\n
  `;

  var mediaConfig = jsonfile.readFileSync(mediaConfigFilepath);

  if (onlyCopyScore) {
    bundle();
  }
  else {
    // copy web template
    ncp(__dirname + '/../web-template', outputFilepath, (err) => {
      if (err) {
        return console.error(err);
      }

      if (mediaConfig.path && mediaConfig.path.length > 0) {
        // copy media
        ncp(mediaConfig.path, outputFilepath + '/media', (err) => {
          if (err) {
            return console.error(err);
          }

          bundle();
        });
      }
      else {
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
    var bundler = browserify(tempMainFilename).transform(babelify, {presets: ['es2015']});

    if (shouldUglify) {
      bundler.transform({global: true}, uglifyify);
    }

    bundler.bundle()
      .pipe(fs.createWriteStream(outputFilepath + '/js/build.js'))
      .on('finish', () => {
        fs.unlinkSync(tempMainFilename);
        fs.unlinkSync(tempConfigFilename);
      });
  }
})();
