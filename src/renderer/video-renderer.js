
var path = require('path');
var Renderer = require('./renderer');
var ScheduledUnit = require('./scheduled-unit');

module.exports = class VideoRenderer extends Renderer {
  constructor(options) {
    super(options);

    this.maxVideoDuration = options.maxVideoDuration || 60 * 1000 * 1; // 10 minutes

    this.videoSourceMaker = options.videoSourceMaker !== undefined ? options.videoSourceMaker : (filename) => {
      return path.join(this.mediaConfig.path, filename);
    };

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
      if (now - lastScheduleTime > 50) {
        this.handleLackOfActivity();
      }
    }, 50);
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
    // TODO: create video file, right now just logging the timeline
    console.log('\nfinal video timeline:\n');
    this.renderStructure.scheduledUnits.forEach((unit) => {
      console.log(unit.toString());
    });
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
