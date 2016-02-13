
import { Renderer } from './renderer';
import {ncp} from 'ncp';
import {writeFileSync} from 'fs';

export class WebRenderer extends Renderer {
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
}
