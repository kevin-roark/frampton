#!/usr/local/bin/node
'use strict';

var fs = require('fs');
var Converter = require('csvtojson').Converter;

var args = process.argv.slice(2);

var csvPath = args.length > 0 ? args[0] : 'csv.csv';
var outputFilepath = args.indexOf('--out') >= 0 ? args[args.indexOf('--out') + 1] : 'csv_config.json';
var silent = args.indexOf('--silent') > 0;
var fps = args.indexOf('--fps') > 0 ? parseFloat(args[args.indexOf('--fps') + 1]) : 30;

var converter = new Converter({});
converter.on("end_parsed", function (json) {
  var formattedJSON = format(json);
  writeToFile(formattedJSON);
});

fs.createReadStream(csvPath).pipe(converter);

function writeToFile(json) {
  log('writing to file...');
  fs.writeFileSync(outputFilepath, JSON.stringify(json));

  log('generated config at ' + outputFilepath);
}

function format(json) {
  json.forEach(function (item) {
    if (item.time) {
      // hours, minutes, seconds, frames
      var split = item.time.split(';');
      var seconds = parseFloat(split[0]) * 3600 + parseFloat(split[1]) * 60 + parseFloat(split[2]) + parseFloat(split[3]) / fps;

      item.time = seconds;
    }

    if (!item.start) {
      item.start = 0;
    }
  });

  return json;
}

function log(text) {
  if (!silent) {
    console.log(text);
  }
}