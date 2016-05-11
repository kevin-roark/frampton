
var WebRenderer = require('./web-renderer');
var THREE = require('three');

module.exports = class WebRenderer3D extends WebRenderer {
  constructor(options) {
    let { rendererProvider, sceneProvider, cameraProvider } = options;

    if (!rendererProvider) rendererProvider = () => {
      let renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xfffff, 1);
      return renderer;
    };
    this.renderer = rendererProvider();

    if (!sceneProvider) sceneProvider = () => { return new THREE.Scene(); };
    this.scene = sceneProvider();

    if (!cameraProvider) cameraProvider = () => { return new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 5000); };
    this.camera = cameraProvider();
    this.scene.add(this.camera);

    this.ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(this.ambientLight);

    super(options);

    this.domContainer.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.resize.bind(this));
    this.resize();
  }

  resize() {
    if (this.renderer) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    super.update();

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  renderVideoSegment(segment, { offset = 0 }) {
    // gonna wanna override this sucker to put the video in a 3d world
  }

};
