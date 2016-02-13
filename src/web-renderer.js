
var Renderer = require('./renderer');
var ncp = require('ncp').ncp;
var writeFileSync = require('fs').writeFileSync;

module.exports = class WebRenderer extends Renderer {
  constructor(options) {
    super(options);
  }

  render() {
    ncp(__dirname + '/web-template', this.outputFilepath, (err) => {
      if (err) {
        return console.error(err);
      }

      let mainJS = `
        (function() {
          var framptonWeb = require('./frampton-web');

          framptonWeb.start({mediaFilepath: ${this.mediaFilepath}, segment: ${this.segment}});
        })();\n
      `;
      writeFileSync(this.outputFilepath + '/js/main.js', mainJS);
    });
  }
};
