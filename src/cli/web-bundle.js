#!/usr/local/bin/node

var ncp = require('ncp').ncp;
var fs = require('fs');
var jsonfile = require('jsonfile');
var browserify = require('browserify');

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
var outputFilepath = args.length > 2 ? args[2] : './out';

var score = fs.readFileSync(scoreFilePath).toString();

// TODO: should just be able to require('frampton')
var mainJS = `
  (function() {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (!isChrome) {
      console.log('only chrome is supported for now...');
      return;
    }

    var frampton = require('../../src/frampton');
    var mediaConfig = require('./media_config.json');

    ${score}
  })();\n
`;

var mediaConfig = jsonfile.readFileSync(mediaConfigFilepath);

// copy web template
ncp(__dirname + '/../web-template', outputFilepath, (err) => {
  if (err) {
    return console.error(err);
  }

  // copy media
  ncp(mediaConfig.path, outputFilepath + '/media', (err) => {
    if (err) {
      return console.error(err);
    }

    // modify and write config
    mediaConfig.path = 'media/';
    fs.writeFileSync(outputFilepath + '/js/media_config.json', JSON.stringify(mediaConfig));

    // copy score code
    var mainFilename = outputFilepath + '/js/main.js';
    fs.writeFileSync(mainFilename, mainJS);

    // bundle it up
    // TODO: run the whole thing through uglifyjs
    browserify(mainFilename)
      .transform('babelify', {presets: ['es2015']})
      //.transform({global: true}, 'uglifyify')
      .bundle()
      .pipe(fs.createWriteStream(outputFilepath + '/js/build.js'));
  });
});
