
var fs = require('fs');
var path = require('path');
var Renderer = require('./renderer');
var ScheduledUnit = require('./scheduled-unit');
var util = require('../etc/util');
var execSync = require('child_process').execSync;

module.exports = class VideoRenderer extends Renderer {
  constructor(options) {
    super(options);

    this.renderedVideoName = options.renderedVideoName || this.mediaConfig.__renderedVideoName || 'frampton-final.mp4';

    this.maxVideoDuration = options.maxVideoDuration || 60 * 1000 * 15; // 15 minutes
    this.enforceHardDurationLimit = options.enforceHardDurationLimit !== undefined ? options.enforceHardDurationLimit : true;
    this.inputVideosHaveDifferentCodecs = options.inputVideosHaveDifferentCodecs !== undefined ? options.inputVideosHaveDifferentCodecs : false;

    this.videoSourceMaker = options.videoSourceMaker !== undefined ? options.videoSourceMaker : (filename) => {
      return path.join(this.mediaConfig.path, filename);
    };

    this.filenameIndex = 0;

    this.currentOffset = 0;
    this.renderStructure = {
      scheduledUnits: []
    };

    this.watchScheduleActivity();
  }

  watchScheduleActivity() {
    this.activityInterval = setInterval(() => {
      var lastScheduleTime = this.lastScheduleTime || 0;
      var now = new Date();
      if (now - lastScheduleTime > 30) {
        this.handleLackOfActivity();
      }
    }, 30);
  }

  handleLackOfActivity() {
    if (this.log) {
      console.log('handling lack of activity...');
    }

    var units = this.renderStructure.scheduledUnits;

    var didCallDynamicFunction = false;
    var totalDuration = 0;
    units.forEach((scheduledUnit) => {
      this.currentOffset = scheduledUnit.offset; // works because we are sorted by offset

      var segment = scheduledUnit.segment;

      if (segment.onStart) {
        segment.didStart();
        didCallDynamicFunction = true;
      }

      this.currentOffset += segment.msDuration();

      if (segment.onComplete) {
        segment.cleanup();
        didCallDynamicFunction = true;
      }

      totalDuration = Math.max(totalDuration, this.currentOffset);
    });

    if (!didCallDynamicFunction || totalDuration > this.maxVideoDuration) {
      clearInterval(this.activityInterval);

      this.renderToVideo();
    }
  }

  renderToVideo() {
    if (!fs.existsSync(this.outputFilepath)) {
      fs.mkdirSync(this.outputFilepath);
    }

    var units = this.renderStructure.scheduledUnits;

    // pre-processing
    var firstUnitOffset = units[0].offset;
    units.forEach((unit) => {
      unit.offset -= firstUnitOffset; // remove beginning offset padding
      unit.currentFile = this.videoSourceMaker(unit.segment.filename);
    });

    // trim outlying units
    this.removeUnrenderableUnits(units);

    // log complete timeline
    if (this.log) {
      console.log('\nfinal video timeline:\n');
      units.forEach((unit) => {
        console.log(unit.toString());
      });
      console.log('\n');
    }

    var visualUnits = [], audioUnits = [];
    units.forEach((unit) => {
      if (unit.segment.segmentType !== 'audio') {
        visualUnits.push(unit);
      }
      else {
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

    console.log(`\nrendered video to ${outname}\n`);
  }

  executeFFMPEGCommand(command) {
    if (this.log) {
      console.log(`running: ${command}`);
    }

    return execSync(command, {stdio: ['pipe', 'pipe', 'ignore']}).toString();
  }

  cutUnitsIntoChunks(units) {
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
        }
        else {
          duration = segmentDuration;
        }
      }

      duration = duration / 1000;

      let filename, command;
      switch (unit.segment.segmentType) {
        case 'image':
          filename = this.generateVideoFilename();
          command = `ffmpeg -loop 1 -i ${unit.currentFile} -t ${duration} -c:v h264 -c:a aac -threads 0 ${filename}`;
          break;

        case 'video':
          // only perform the trim if *strictly* necessary
          if (start > 0 || duration < unit.segment.mediaDuration || unit.segment.volume < 1) {
            filename = this.generateVideoFilename();
            command = `ffmpeg -ss ${start} -t ${duration} -i ${unit.currentFile} -af "volume=${unit.segment.volume}" -t ${duration} -c:v h264 -c:a aac -threads 0 ${filename}`;
          }
          break;

        default: break;
      }

      if (filename && command) {
        this.executeFFMPEGCommand(command);
        unit.currentFile = filename;
      }
    }
  }

  concatenateUnits(units) {
    var files = [];
    units.forEach((unit) => {
      files.push(unit.currentFile);
    });

    return this.concatenateFiles(files);
  }

  concatenateFiles(files) {
    // https://trac.ffmpeg.org/wiki/Concatenate
    if (this.inputVideosHaveDifferentCodecs) {
      return this.concatenateFilesWithConcatFilter(files);
    }
    else {
      return this.concatenateFilesWithConcatCommand(files);
    }
  }

  concatenateFilesWithConcatFilter(files) {
    var concat = (arr) => {
      var newFiles = [];

      var chunks = util.splitArray(arr, 32);
      chunks.forEach((chunk) => {
        var command = `ffmpeg `;

        chunk.forEach((file) => {
          command += `-i ${file} `;
        });

        command += ` -filter_complex "`;

        chunk.forEach((file, i) => {
          command += `[${i}:v:0] [${i}:a:0] `;
        });

        var filename = this.generateVideoFilename();
        command += `concat=n=${chunk.length}:v=1:a=1 [v] [a]"`;
        command += ` -map "[v]" -map "[a]" -c:v h264 -c:a aac ${filename}`;
        this.executeFFMPEGCommand(command);

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

  concatenateFilesWithConcatCommand(files) {
    var concatVideoFilename = this.generateVideoFilename();

    // one video per line
    var concatInfo = '';
    files.forEach((file) => {
      concatInfo += `file ${file}\n`;
    });

    // write lines to file
    var concatInfoFilename = 'temp-concat-inputs.txt';
    fs.writeFileSync(concatInfoFilename, concatInfo);

    // concat to single video
    var command = `ffmpeg -f concat -i ${concatInfoFilename} -c:v copy -c:a copy -threads 0 ${concatVideoFilename}`;
    this.executeFFMPEGCommand(command);

    // remove concat info file
    fs.unlink(concatInfoFilename);

    return concatVideoFilename;
  }

  mixAudioUnits(videoFile, units) {
    // truly helpful: http://superuser.com/questions/716320/ffmpeg-placing-audio-at-specific-location
    // other resource: http://stackoverflow.com/questions/32988106/ffmpeg-replace-part-of-audio-in-mp4-video-file

    if (units.length === 0) {
      return videoFile;
    }

    // reverse units so that we are dealing the highest delayed items first
    units.reverse();

    var currentVideoFile = videoFile;

    var unitChunks = util.splitArray(units, 31);
    unitChunks.forEach((units) => {
      var command = `ffmpeg -i ${currentVideoFile}`;
      units.forEach((unit) => {
        var segment = unit.segment;
        command += ` -ss ${segment.startTime} -t ${segment.getDuration()} -i ${unit.currentFile}`;
      });

      var names = '';

      command += ` -filter_complex "`;
      units.forEach((unit, idx) => {
        var segment = unit.segment;
        command += `[${idx+1}:a]asetpts=PTS-STARTPTS`;
        if (segment.fadeInDuration) {
          command += `,afade=t=in:st=0:d=${segment.fadeInDuration}`;
        }
        if (segment.fadeOutDuration) {
          command += `,afade=t=out:st=${segment.getDuration() - segment.fadeOutDuration}:d=${segment.fadeOutDuration}`;
        }
        if (unit.offset > 0) {
          command += `,adelay=${unit.offset}|${unit.offset}`; // supposed to be in ms wow!!
        }
        var name = `[aud${idx+1}]`;
        command += `${name};`;
        names += name;
      });

      var newVideoFile = this.generateVideoFilename();
      var numberOfInputs = units.length + 1;
      command += `[0:a]${names}amix=inputs=${numberOfInputs},volume=${numberOfInputs}"  -map 0:v -c:v copy -threads 0 ${newVideoFile}`;
      this.executeFFMPEGCommand(command);

      currentVideoFile = newVideoFile;
    });

    units.reverse(); // revert units back to its initial state

    return currentVideoFile;
  }

  removeUnrenderableUnits(units) {
    for (var i = units.length - 1; i >= 0; i--) {
      var unit = units[i];
      if (this.enforceHardDurationLimit && unit.offset + unit.segment.msDuration() > this.maxVideoDuration) {
        units.splice(i, 1);
      }
    }
  }

  /// Filesystem

  getFilename(name) {
    return path.join(this.outputFilepath, name);
  }

  getVideoFilename(name) {
    return this.getFilename(`${name}.mp4`);
  }

  generateVideoFilename() {
    this.filenameIndex += 1;
    return this.getVideoFilename(this.filenameIndex);
  }

  deleteTemporaryFiles() {
    for (var i = 1; i <= this.filenameIndex; i++) {
      var filename = this.getVideoFilename(i);
      fs.unlink(filename, () => {
        // ignore any error
      });
    }
  }

  /// Scheduling

  scheduleSegmentRender(segment, delay) {
    super.scheduleSegmentRender(segment, delay);

    this.renderSegment(segment, {offset: delay});

    this.lastScheduleTime = new Date();
  }

  scheduleMediaSegment(segment, offset) {
    if (this.log) {
      console.log(`scheduling ${segment.simpleName()} at ${offset}`);
    }

    var scheduledOffset = this.currentOffset + offset;
    var scheduledUnit = new ScheduledUnit(segment, scheduledOffset);

    this.insertScheduledUnit(scheduledUnit, this.renderStructure.scheduledUnits);

    this.lastScheduleTime = new Date();
  }

  /// Rendering

  renderVideoSegment(segment, options) {
    this.renderMediaSegment(segment, options);
  }

  renderImageSegment(segment, options) {
    this.renderMediaSegment(segment, options);
  }

  renderAudioSegment(segment, options) {
    this.renderMediaSegment(segment, options);
  }

  renderMediaSegment(segment, {offset=0}) {
    this.scheduleMediaSegment(segment, offset);

    if (segment.loop) {
      segment.onComplete = undefined; // will never complete...

      for (var time = offset + segment.msDuration(); time < this.maxVideoDuration; time += segment.msDuration()) {
        this.scheduleMediaSegment(segment, time);
      }
    }
  }
};
