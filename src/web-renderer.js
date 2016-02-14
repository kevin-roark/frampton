
var Renderer = require('./renderer');

module.exports = class WebRenderer extends Renderer {
  constructor(options) {
    super(options);
  }

  render() {
    console.log('frampton is starting now...');
  }
};
