
var fs = require('fs');
var path = require('path');
var Renderer = require('./renderer');
var ScheduledUnit = require('./scheduled-unit');
var execSync = require('child_process').execSync;

module.exports = class VideoRenderer extends Renderer {
  constructor(options) {
    super(options);

    this.maxVideoDuration = options.maxVideoDuration || 60 * 1000 * 15; // 15 minutes
    this.enforceHardDurationLimit = options.enforceHardDurationLimit !== undefined ? options.enforceHardDurationLimit : true;

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
    units.forEach((unit) => {
      unit.offset -= units[0].offset; // remove beginning offset padding
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

    // cut units into smaller units of continuous files
    this.cutUnitsIntoChunks(units);

    // concatenate trimmed files
    var concatFile = this.concatenateUnits(units);

    // move the concattenated file, as it is the final frampton render!
    var outname = this.getFilename('frampton-final.mp4');
    fs.renameSync(concatFile, outname);

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
      var duration;
      if (idx < units.length - 1) {
        var nextUnit = units[idx + 1];
        var segmentDuration = unit.segment.msDuration();
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

      // only perform the trim if *strictly* necessary
      if (start > 0 || duration < unit.segment.mediaDuration) {
        var filename = this.generateVideoFilename();
        var command = `ffmpeg -ss ${start} -t ${duration} -i ${unit.currentFile} -c:v copy ${filename}`;
        this.executeFFMPEGCommand(command);

        unit.currentFile = filename;
      }
    }
  }

  concatenateUnits(units) {
    // https://trac.ffmpeg.org/wiki/Concatenate

    // one video per line
    var concatInfo = '';
    units.forEach((unit) => {
      concatInfo += `file ${unit.currentFile}\n`;
    });

    // write lines to file
    var concatInfoFilename = 'temp-concat-inputs.txt';
    fs.writeFileSync(concatInfoFilename, concatInfo);

    // concat to single video
    var concatVideoFilename = this.generateVideoFilename();
    var command = `ffmpeg -f concat -i ${concatInfoFilename} -c:v copy -c:a copy ${concatVideoFilename}`;
    this.executeFFMPEGCommand(command);

    // remove concat info file
    fs.unlink(concatInfoFilename);

    return concatVideoFilename;
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

  renderVideoSegment(segment, {offset=0}) {
    this.scheduleMediaSegment(segment, offset);

    if (segment.loop) {
      segment.onComplete = undefined; // will never complete...

      for (var time = offset + segment.msDuration(); time < this.maxVideoDuration; time += segment.msDuration()) {
        this.scheduleMediaSegment(segment, time);
      }
    }
  }
};
