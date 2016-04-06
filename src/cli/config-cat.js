#!/usr/local/bin/node

var fs = require('fs');
var jsonfile = require('jsonfile');

(function() {
  var args = process.argv.slice(2);

  if (args.length <= 1) {
    console.log('arg format: config1 config2 ... outconfig');
    return;
  }

  var outputFilepath = args[args.length - 1];

  var catConfig = {
    videos: []
  };

  for (var i = 0; i < args.length - 1; i++) {
    var config = jsonfile.readFileSync(args[i]);

    catConfig.videos = catConfig.videos.concat(config.videos);

    if (i === 0) {
      catConfig.path = config.path;
    }
  }

  catConfig.videos.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });

  var jsonConfig = JSON.stringify(catConfig);
  fs.writeFileSync(outputFilepath, jsonConfig);
  console.log(`generated config at ${outputFilepath}`);
})();
