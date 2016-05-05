#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var Subtitle = require('subtitle');
var exec = require('child_process').exec;

(function() {
  var args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('need an srt file...');
    return;
  }
  if (args.length < 2) {
    console.log('need a video source file...');
    return;
  }

  var inputFilepath = args[0];
  var videoFilepath = args[1];
  var csv = args.indexOf('--csv') > 0;
  var outputFilepath = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : 'out';
  var outputPrefix = args.indexOf('--pre') > 0 ? args[args.indexOf('--pre') + 1] : '';
  var fps = args.indexOf('--fps') > 0 ? parseFloat(args[args.indexOf('--fps') + 1]) : 24;
  var cutForPremiere = args.indexOf('--premiere') > 0;
  var seperateAudio = args.indexOf('--A') > 0;
  var noVideo = args.indexOf('--Vx') > 0;
  var seperateVideo = args.indexOf('--V') > 0;
  var videoHandleLength = args.indexOf('--vh') > 0 ? parseFloat(args[args.indexOf('--vh') + 1]) : 0;
  var audioHandleLength = args.indexOf('--ah') > 0 ? parseFloat(args[args.indexOf('--ah') + 1]) : 0;
  var offset = args.indexOf('--offset') > 0 ? parseFloat(args[args.indexOf('--offset') + 1]) : 0;
  var firstIdxMultiplier = args.indexOf('--start') > 0 ? parseFloat(args[args.indexOf('--start') + 1]) : 2; // values less than 2 trim the begining
  var lastIdxMultiplier = args.indexOf('--end') > 0 ? parseFloat(args[args.indexOf('--end') + 1]) : 2; // values less than 2 trim the end

  var commandsRunning = 0;
  var commandQueue = [];

  if (csv) {
    convertCSV(inputFilepath, function(csvJSON) {
      shotSplit(csvJSON);
    });
  }
  else {
    var subtitles = fs.readFileSync(inputFilepath).toString().replace(/\./g, ',');
    var subtitleParser = new Subtitle(subtitles);

    var srtData = subtitleParser.getSubtitles({
      duration: true,
      timeFormat: 'ms'
    });
    shotSplit(srtData);
  }

  function shotSplit(shotData) {
    var lastIdx = shotData.length - 1;
    var msPerFrame = 41;
    offset = (offset * msPerFrame) / 1000;
    var startMultiplier = cutForPremiere ? 3 : 2;
    var normalMultiplier = cutForPremiere ? 2 : 1;

    if (cutForPremiere) {
      lastIdxMultiplier = 3;
    }

    if (!fs.existsSync(outputFilepath)) {
      fs.mkdirSync(outputFilepath);
    }

    shotData.forEach(function(shot, idx) {
      var start, videoStart, audioStart, duration, videoDuration, audioDuration;
      if (idx === 0) {
        start = (shot.start - (firstIdxMultiplier * msPerFrame))  / 1000;

        duration = shot.duration / 1000;

        if (shot.start < audioHandleLength){
          videoStart = start;
          audioStart = start;
          videoDuration = duration + videoHandleLength - offset;
          audioDuration = duration + audioHandleLength - offset;
        }
        else{
          videoStart = start - videoHandleLength;
          audioStart = start - audioHandleLength;
          videoDuration = duration + videoHandleLength * 2 - offset;
          audioDuration = duration + audioHandleLength * 2 - offset;
        }

      }
      else if (idx === 1) {
        start = (shot.start - (startMultiplier  * msPerFrame))  / 1000;
        videoStart = start - videoHandleLength;
        audioStart = start - audioHandleLength;
        duration = (shot.duration + (2 * msPerFrame)) / 1000;
        videoDuration = duration + videoHandleLength * 2 - offset;
        audioDuration = duration + audioHandleLength * 2 - offset;
        if (videoStart < 0) {
          videoStart = 0;
          videoDuration = duration + videoHandleLength + shot.start;
        }
        if (audioStart < 0) {
          audioStart = 0;
          audioDuration = duration + audioHandleLength + shot.start;
        }
      }
      else if (idx === lastIdx) {
        start = (shot.start - (startMultiplier * msPerFrame))  / 1000;
        videoStart = start - videoHandleLength;
        audioStart = start - audioHandleLength;

        duration = (shot.duration + (lastIdxMultiplier * msPerFrame)) / 1000; // premiere value is 3
        videoDuration = duration + videoHandleLength  - offset;
        audioDuration = duration + audioHandleLength  - offset;
      }
      else {
        start = Math.max(0, (shot.start - (startMultiplier * msPerFrame)) / 1000);
        videoStart = Math.max(0, start - videoHandleLength);
        audioStart = Math.max(0, start - audioHandleLength);

        duration = (shot.duration + (normalMultiplier * msPerFrame)) / 1000; // premiere value is 2
        videoDuration = duration + 2 * videoHandleLength  - offset;
        audioDuration = duration + 2 * audioHandleLength  - offset;
      }

      if (!noVideo) {
        var videoOutfile = path.join(outputFilepath, outputPrefix + `${shot.index}.mp4`);
        var videoCommand = `ffmpeg -ss ${videoStart} -t ${videoDuration} -i ${videoFilepath} -c:v libx264 ${videoOutfile}`;
        run(videoCommand);
      }

      if (seperateAudio) {
        var audioOutfile = path.join(outputFilepath, outputPrefix + `${shot.index}.mp3`);
        var audioCommand = `ffmpeg -ss ${audioStart} -t ${audioDuration} -i ${videoFilepath} -b:a 192K -vn ${audioOutfile}`;
        run(audioCommand);
      }

      if (seperateVideo) {
        var videoOutfile = path.join(outputFilepath, outputPrefix + `${shot.index}-v.mp4`);
        var videoCommand = `ffmpeg -ss ${videoStart} -t ${videoDuration} -i ${videoFilepath} -c copy -an ${videoOutfile}`;
        run(videoCommand);
      }
    });
  }

  function run(command) {
    if (commandsRunning > 5) {
      commandQueue.push(command);
      return;
    }
    commandsRunning += 1;
    exec(command, (err) => {
      if (err) {
        console.log(err);
      }

      commandsRunning -= 1;
      if (commandQueue.length > 0) {
        var nextCommand = commandQueue.shift();
        run(nextCommand);
      }
    });
  }

  function convertCSV(csvFile, callback) {
    if (!callback) return;

    var Converter = require('csvtojson').Converter;

    var converter = new Converter({});
    converter.on("end_parsed", function(json) {
      var formattedJSON = formatJSON(json);
      callback(formattedJSON);
    });

    fs.createReadStream(csvFile).pipe(converter);

    function formatJSON(json) {
      json.forEach(function(item, idx) {
        item.index = idx;

        if (item.In) {
          item.start = toMS(item.In);
        }

        if (item.Duration) {
          item.duration = toMS(item.Duration);
        }
      });

      return json;
    }

    function toMS(frameSecondsString) {
      var split = frameSecondsString.split(':');
      var seconds =
        parseFloat(split[0]) * 3600 +
        parseFloat(split[1]) * 60 +
        parseFloat(split[2]) +
        parseFloat(split[3]) / fps;
      return seconds * 1000;
    }
  }

})();
