'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fs = require('fs');
var path = require('path');
var Renderer = require('./renderer');
var ScheduledUnit = require('./scheduled-unit');
var util = require('../etc/util');
var execSync = require('child_process').execSync;

module.exports = function (_Renderer) {
  _inherits(VideoRenderer, _Renderer);

  function VideoRenderer(options) {
    _classCallCheck(this, VideoRenderer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(VideoRenderer).call(this, options));

    _this.renderedVideoName = options.renderedVideoName || _this.mediaConfig.__renderedVideoName || 'frampton-final.mp4';

    _this.maxVideoDuration = options.maxVideoDuration || 60 * 1000 * 15; // 15 minutes
    _this.enforceHardDurationLimit = options.enforceHardDurationLimit !== undefined ? options.enforceHardDurationLimit : true;
    _this.inputVideosHaveDifferentCodecs = options.inputVideosHaveDifferentCodecs !== undefined ? options.inputVideosHaveDifferentCodecs : false;

    _this.videoSourceMaker = options.videoSourceMaker !== undefined ? options.videoSourceMaker : function (filename) {
      return path.join(_this.mediaConfig.path, filename);
    };

    _this.filenameIndex = 0;

    _this.currentOffset = 0;
    _this.renderStructure = {
      scheduledUnits: []
    };

    _this.watchScheduleActivity();
    return _this;
  }

  _createClass(VideoRenderer, [{
    key: 'watchScheduleActivity',
    value: function watchScheduleActivity() {
      var _this2 = this;

      this.activityInterval = setInterval(function () {
        var lastScheduleTime = _this2.lastScheduleTime || 0;
        var now = new Date();
        if (now - lastScheduleTime > 30) {
          _this2.handleLackOfActivity();
        }
      }, 30);
    }
  }, {
    key: 'handleLackOfActivity',
    value: function handleLackOfActivity() {
      var _this3 = this;

      if (this.log) {
        console.log('handling lack of activity...');
      }

      var units = this.renderStructure.scheduledUnits;

      var didCallDynamicFunction = false;
      var totalDuration = 0;
      units.forEach(function (scheduledUnit) {
        _this3.currentOffset = scheduledUnit.offset; // works because we are sorted by offset

        var segment = scheduledUnit.segment;

        if (segment.onStart) {
          segment.didStart();
          didCallDynamicFunction = true;
        }

        _this3.currentOffset += segment.msDuration();

        if (segment.onComplete) {
          segment.cleanup();
          didCallDynamicFunction = true;
        }

        totalDuration = Math.max(totalDuration, _this3.currentOffset);
      });

      if (!didCallDynamicFunction || totalDuration > this.maxVideoDuration) {
        clearInterval(this.activityInterval);

        this.renderToVideo();
      }
    }
  }, {
    key: 'renderToVideo',
    value: function renderToVideo() {
      var _this4 = this;

      if (!fs.existsSync(this.outputFilepath)) {
        fs.mkdirSync(this.outputFilepath);
      }

      var units = this.renderStructure.scheduledUnits;

      // pre-processing
      var firstUnitOffset = units[0].offset;
      units.forEach(function (unit) {
        unit.offset -= firstUnitOffset; // remove beginning offset padding
        unit.currentFile = _this4.videoSourceMaker(unit.segment.filename);
      });

      // trim outlying units
      this.removeUnrenderableUnits(units);

      // log complete timeline
      if (this.log) {
        console.log('\nfinal video timeline:\n');
        units.forEach(function (unit) {
          console.log(unit.toString());
        });
        console.log('\n');
      }

      var visualUnits = [],
          audioUnits = [];
      units.forEach(function (unit) {
        if (unit.segment.segmentType !== 'audio') {
          visualUnits.push(unit);
        } else {
          audioUnits.push(unit);
        }
      });

      // cut units into smaller units of continuous files
      this.cutUnitsIntoChunks(visualUnits);

      // concatenate trimmed files into gapless video
      var concatFile = this.concatenateUnits(visualUnits);

      // add audio to video baby
      var mixedVideoFile = this.mixAudioUnits(concatFile, audioUnits);

      // move the concattenated file, as it is the final frampton render!
      var outname = this.getFilename(this.renderedVideoName);
      fs.renameSync(mixedVideoFile, outname);

      // clean up temporary files
      this.deleteTemporaryFiles();

      console.log('\nrendered video to ' + outname + '\n');
    }
  }, {
    key: 'executeFFMPEGCommand',
    value: function executeFFMPEGCommand(command) {
      if (this.log) {
        console.log('running: ' + command);
      }

      return execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    }
  }, {
    key: 'cutUnitsIntoChunks',
    value: function cutUnitsIntoChunks(units) {
      // trim the video file of each unit to the actual portion renderered
      for (var idx = 0; idx < units.length; idx++) {
        var unit = units[idx];

        var start = unit.segment.startTime;

        // TODO: account for z-indexing in this shit, right now it will always assume next video has higher z
        var segmentDuration = unit.segment.msDuration();
        var duration = segmentDuration;
        if (idx < units.length - 1) {
          var nextUnit = units[idx + 1];
          var offset = unit.offset + segmentDuration;

          if (offset > nextUnit.offset) {
            // the next segment starts before this ends, need to trim brother
            duration = nextUnit.offset - unit.offset;

            // if there is additional duration in this clip after the next unit ends, we should add a new unit in between
            // the next unit and the unit following it
            var nextUnitEndTime = nextUnit.offset + nextUnit.segment.msDuration();
            var afterNextUnitDuration = offset - nextUnitEndTime;
            if (afterNextUnitDuration > 0) {
              if (idx === units.length - 2 || units[idx + 2].offset > nextUnitEndTime) {
                var afterNextUnitStartTime = start + (duration - afterNextUnitDuration);
                var newSegment = unit.segment.clone().setStartTime(afterNextUnitStartTime).setDuration(afterNextUnitDuration);

                var newUnit = new ScheduledUnit(newSegment, nextUnitEndTime);
                newUnit.currentFile = unit.currentFile;

                units.splice(idx + 2, 0, newUnit); // insert new unit after next unit
              }
            }
          } else {
              duration = segmentDuration;
            }
        }

        duration = duration / 1000;

        var filename = undefined,
            command = undefined;
        switch (unit.segment.segmentType) {
          case 'image':
            filename = this.generateVideoFilename();
            command = 'ffmpeg -f lavfi -i aevalsrc=0 -loop 1 -i ' + unit.currentFile + ' -t ' + duration + ' -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -pix_fmt yuv420p -c:v h264 -c:a aac -threads 0 ' + filename;
            break;

          case 'video':
            // only perform the trim if *strictly* necessary
            if (start > 0 || duration < unit.segment.mediaDuration || unit.segment.volume < 1) {
              filename = this.generateVideoFilename();
              command = 'ffmpeg -ss ' + start + ' -t ' + duration + ' -i ' + unit.currentFile + ' -af "volume=' + unit.segment.volume + '" -t ' + duration + ' -c:v h264 -c:a aac -threads 0 ' + filename;
            }
            break;

          default:
            break;
        }

        if (filename && command) {
          this.executeFFMPEGCommand(command);
          unit.currentFile = filename;
        }
      }
    }
  }, {
    key: 'concatenateUnits',
    value: function concatenateUnits(units) {
      var files = [];
      units.forEach(function (unit) {
        files.push(unit.currentFile);
      });

      return this.concatenateFiles(files);
    }
  }, {
    key: 'concatenateFiles',
    value: function concatenateFiles(files) {
      // https://trac.ffmpeg.org/wiki/Concatenate
      if (this.inputVideosHaveDifferentCodecs) {
        return this.concatenateFilesWithConcatFilter(files);
      } else {
        return this.concatenateFilesWithConcatCommand(files);
      }
    }
  }, {
    key: 'concatenateFilesWithConcatFilter',
    value: function concatenateFilesWithConcatFilter(files) {
      var _this5 = this;

      var concat = function concat(arr) {
        var newFiles = [];

        var chunks = util.splitArray(arr, 32);
        chunks.forEach(function (chunk) {
          var command = 'ffmpeg ';

          chunk.forEach(function (file) {
            command += '-i ' + file + ' ';
          });

          command += ' -filter_complex "';

          chunk.forEach(function (file, i) {
            command += '[' + i + ':v:0] [' + i + ':a:0] ';
          });

          var filename = _this5.generateVideoFilename();
          command += 'concat=n=' + chunk.length + ':v=1:a=1 [v] [a]"';
          command += ' -map "[v]" -map "[a]" -c:v h264 -c:a aac ' + filename;
          _this5.executeFFMPEGCommand(command);

          newFiles.push(filename);
        });

        return newFiles;
      };

      var concatFiles = files;
      while (concatFiles.length > 1) {
        concatFiles = concat(concatFiles);
      }

      return concatFiles[0];
    }
  }, {
    key: 'concatenateFilesWithConcatCommand',
    value: function concatenateFilesWithConcatCommand(files) {
      var concatVideoFilename = this.generateVideoFilename();

      // one video per line
      var concatInfo = '';
      files.forEach(function (file) {
        concatInfo += 'file ' + file + '\n';
      });

      // write lines to file
      var concatInfoFilename = 'temp-concat-inputs.txt';
      fs.writeFileSync(concatInfoFilename, concatInfo);

      // concat to single video
      var command = 'ffmpeg -f concat -i ' + concatInfoFilename + ' -c:v copy -c:a copy -threads 0 ' + concatVideoFilename;
      this.executeFFMPEGCommand(command);

      // remove concat info file
      fs.unlink(concatInfoFilename);

      return concatVideoFilename;
    }
  }, {
    key: 'mixAudioUnits',
    value: function mixAudioUnits(videoFile, units) {
      var _this6 = this;

      // truly helpful: http://superuser.com/questions/716320/ffmpeg-placing-audio-at-specific-location
      // other resource: http://stackoverflow.com/questions/32988106/ffmpeg-replace-part-of-audio-in-mp4-video-file

      if (units.length === 0) {
        return videoFile;
      }

      // reverse units so that we are dealing the highest delayed items first
      units.reverse();

      var currentVideoFile = videoFile;

      var unitChunks = util.splitArray(units, 31);
      unitChunks.forEach(function (units) {
        var command = 'ffmpeg -i ' + currentVideoFile;
        units.forEach(function (unit) {
          var segment = unit.segment;
          command += ' -ss ' + segment.startTime + ' -t ' + segment.getDuration() + ' -i ' + unit.currentFile;
        });

        var names = '';

        command += ' -filter_complex "';
        units.forEach(function (unit, idx) {
          var segment = unit.segment;
          command += '[' + (idx + 1) + ':a]asetpts=PTS-STARTPTS';
          if (segment.fadeInDuration) {
            command += ',afade=t=in:st=0:d=' + segment.fadeInDuration;
          }
          if (segment.fadeOutDuration) {
            command += ',afade=t=out:st=' + (segment.getDuration() - segment.fadeOutDuration) + ':d=' + segment.fadeOutDuration;
          }
          if (unit.offset > 0) {
            command += ',adelay=' + unit.offset + '|' + unit.offset; // supposed to be in ms wow!!
          }
          var name = '[aud' + (idx + 1) + ']';
          command += name + ';';
          names += name;
        });

        var newVideoFile = _this6.generateVideoFilename();
        var numberOfInputs = units.length + 1;
        command += '[0:a]' + names + 'amix=inputs=' + numberOfInputs + ',volume=' + numberOfInputs + '"  -map 0:v -c:v copy -threads 0 ' + newVideoFile;
        _this6.executeFFMPEGCommand(command);

        currentVideoFile = newVideoFile;
      });

      units.reverse(); // revert units back to its initial state

      return currentVideoFile;
    }
  }, {
    key: 'removeUnrenderableUnits',
    value: function removeUnrenderableUnits(units) {
      for (var i = units.length - 1; i >= 0; i--) {
        var unit = units[i];
        if (this.enforceHardDurationLimit && unit.offset + unit.segment.msDuration() > this.maxVideoDuration) {
          units.splice(i, 1);
        }
      }
    }

    /// Filesystem

  }, {
    key: 'getFilename',
    value: function getFilename(name) {
      return path.join(this.outputFilepath, name);
    }
  }, {
    key: 'getVideoFilename',
    value: function getVideoFilename(name) {
      return this.getFilename(name + '.mp4');
    }
  }, {
    key: 'generateVideoFilename',
    value: function generateVideoFilename() {
      this.filenameIndex += 1;
      return this.getVideoFilename(this.filenameIndex);
    }
  }, {
    key: 'deleteTemporaryFiles',
    value: function deleteTemporaryFiles() {
      for (var i = 1; i <= this.filenameIndex; i++) {
        var filename = this.getVideoFilename(i);
        fs.unlink(filename, function () {
          // ignore any error
        });
      }
    }

    /// Scheduling

  }, {
    key: 'scheduleSegmentRender',
    value: function scheduleSegmentRender(segment, delay) {
      _get(Object.getPrototypeOf(VideoRenderer.prototype), 'scheduleSegmentRender', this).call(this, segment, delay);

      this.renderSegment(segment, { offset: delay });

      this.lastScheduleTime = new Date();
    }
  }, {
    key: 'scheduleMediaSegment',
    value: function scheduleMediaSegment(segment, offset) {
      if (this.log) {
        console.log('scheduling ' + segment.simpleName() + ' at ' + offset);
      }

      var scheduledOffset = this.currentOffset + offset;
      var scheduledUnit = new ScheduledUnit(segment, scheduledOffset);

      this.insertScheduledUnit(scheduledUnit, this.renderStructure.scheduledUnits);

      this.lastScheduleTime = new Date();
    }

    /// Rendering

  }, {
    key: 'renderVideoSegment',
    value: function renderVideoSegment(segment, options) {
      this.renderMediaSegment(segment, options);
    }
  }, {
    key: 'renderImageSegment',
    value: function renderImageSegment(segment, options) {
      this.renderMediaSegment(segment, options);
    }
  }, {
    key: 'renderAudioSegment',
    value: function renderAudioSegment(segment, options) {
      this.renderMediaSegment(segment, options);
    }
  }, {
    key: 'renderMediaSegment',
    value: function renderMediaSegment(segment, _ref) {
      var _ref$offset = _ref.offset;
      var offset = _ref$offset === undefined ? 0 : _ref$offset;

      this.scheduleMediaSegment(segment, offset);

      if (segment.loop) {
        segment.onComplete = undefined; // will never complete...

        for (var time = offset + segment.msDuration(); time < this.maxVideoDuration; time += segment.msDuration()) {
          this.scheduleMediaSegment(segment, time);
        }
      }
    }
  }]);

  return VideoRenderer;
}(Renderer);