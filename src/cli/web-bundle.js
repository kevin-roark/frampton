#!/usr/local/bin/node

var ncp = require('ncp').ncp;
var fs = require('fs');

var args = process.argv.slice(2);
if (args.length < 1) {
  console.log('need a score...');
  return;
}

var scoreFilePath = args[0];
var outputFilepath = args.length > 1 ? args[1] : './out';

var score = fs.readFileSync(scoreFilePath).toString();
var mainJS = `
  (function() {
    ${score}
  })();\n
`;

ncp(__dirname + '/../web-template', outputFilepath, (err) => {
  if (err) {
    return console.error(err);
  }

  fs.writeFileSync(outputFilepath + '/js/main.js', mainJS);

  // TODO: bundle with browserify
});
