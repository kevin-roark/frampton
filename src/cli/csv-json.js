#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var jsonfile = require('jsonfile');
var filesInPath = require('./files-in-path');
var simpleAnalysis = require('../analysis/simple-analysis');
require('string-natural-compare');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});

var args = process.argv.slice(2);

var csvPath = args.length > 0 ? args[0] : 'csv.csv';
var outputFilepath = args.indexOf('--out') >= 0 ? args[args.indexOf('--out') + 1] : './csv_config.json';
var silent = args.indexOf('--silent') > 0;

converter.on("end_parsed", function (jsonArray) {
  writeToFile(jsonArray);
});

require("fs").createReadStream(csvPath).pipe(converter);

function writeToFile(jsonArray) {
  log('writing to file...');
  var jsonConfig = JSON.stringify(jsonArray);
  fs.writeFileSync(outputFilepath, jsonConfig);
  console.log(`generated config at ${outputFilepath}`);
}

function format(json) {

}

function log(text) {
  if (!silent) {
    console.log(text);
  }
}
