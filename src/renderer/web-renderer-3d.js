
var WebRenderer = require('./web-renderer');
var THREE = require('three');
var TWEEN = require('tween.js');

module.exports = class WebRenderer3D extends WebRenderer {
  constructor(options) {
    super(options);

    let { rendererProvider, sceneProvider, cameraProvider, ambientLightProvider } = options;

    if (!rendererProvider) rendererProvider = () => {
      let renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xffffff, 1);
      return renderer;
    };
    this.renderer = rendererProvider();

    if (!sceneProvider) sceneProvider = () => { return new THREE.Scene(); };
    this.scene = sceneProvider();

    if (!cameraProvider) cameraProvider = () => {
      return new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    };
    this.camera = cameraProvider();
    this.scene.add(this.camera);

    if (!ambientLightProvider) ambientLightProvider = () => {
      return new THREE.AmbientLight(0x404040);
    };

    this.ambientLight = ambientLightProvider();
    if (this.ambientLight) this.scene.add(this.ambientLight);

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

  renderVideoSegment (segment, options) {
    if (!segment.threeOptions) {
      super.renderVideoSegment(segment, options);
      return;
    }

    let { offset } = options;

    var self = this;

    let { videoMeshWidth = 150, videoSourceWidth = 854, videoMeshHeight = 75, videoSourceHeight = 480, meshConfigurer, geometryProvider } = segment.threeOptions;
    if (!geometryProvider) geometryProvider = () => {
      return new THREE.PlaneGeometry(videoMeshWidth, videoMeshHeight);
    };

    var video = document.createElement('video');
    video.preload = true;
    segment._backingVideo = video;

    var filename = video.canPlayType('video/mp4').length > 0 ? segment.filename : segment.extensionlessName() + '.webm';
    video.src = this.videoSourceMaker(filename);

    video.volume = segment.volume;
    segment.addChangeHandler('volume', function(volume) {
      video.volume = volume;
    });

    video.currentTime = segment.startTime;

    video.playbackRate = segment.playbackRate;
    segment.addChangeHandler('playbackRate', function(playbackRate) {
      video.playbackRate = playbackRate;
    });

    var videoCanvas = document.createElement('canvas');
    videoCanvas.width = videoSourceWidth; videoCanvas.height = videoSourceHeight;

    var videoContext = videoCanvas.getContext('2d');
    videoContext.fillStyle = '#000000'; // background color if no video present
    videoContext.fillRect( 0, 0, videoMeshWidth, videoMeshHeight);

    var videoTexture = new THREE.Texture(videoCanvas);
    videoTexture.minFilter = videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    videoTexture.generateMipmaps = false;

    var videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      overdraw: true,
      side: THREE.DoubleSide
    });

    var videoGeometry = geometryProvider(videoMeshWidth, videoMeshHeight);

    var videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
    if (meshConfigurer) meshConfigurer(videoMesh);

    video.style.display = 'none';
    this.domContainer.appendChild(video);

    var segmentDuration = segment.msDuration();
    var expectedStart = window.performance.now() + offset;
    var renderFunctionID;

    var hasPlayedFirstTime = false;
    video.addEventListener('playing', function() {
      if (hasPlayedFirstTime) return;

      hasPlayedFirstTime = true;
      var now = window.performance.now();
      var startDelay = now + self.startPerceptionCorrection - expectedStart;

      var endTimeout = segmentDuration;
      if (startDelay > self.startPerceptionCorrection) {
        endTimeout -= startDelay;
      }

      setTimeout(end, endTimeout);
    }, false);

    setTimeout(start, offset - this.startDelayCorrection - this.startPerceptionCorrection);

    function start() {
      self.scene.add(videoMesh);
      video.play();

      renderFunctionID = self.addUpdateFunction(updateVideo);

      function updateVideo() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          videoContext.drawImage(video, 0, 0);
          videoTexture.needsUpdate = true;
        }
      }

      var videoFadeDuration = segment.videoFadeDuration || self.videoFadeDuration;
      if (videoFadeDuration) {
        videoFadeDuration = Math.min(videoFadeDuration, segmentDuration / 2);

        // fade in
        videoMaterial.transparent = true;
        videoMaterial.opacity = 0;
        new TWEEN.Tween(videoMaterial)
          .to({opacity: segment.opacity}, videoFadeDuration)
          .start();

        // fade out
        setTimeout(function() {
          new TWEEN.Tween(videoMaterial)
            .to({opacity: 0}, videoFadeDuration)
            .start();
        }, segmentDuration - videoFadeDuration);
      }
      else if (segment.opacity < 1) {
        videoMaterial.transparent = true;
        videoMaterial.opacity = segment.opacity;
      }

      self.fadeAudioForVideoSegment(segment, video);

      segment.didStart();
    }

    function end() {
      if (segment.loop) {
        video.currentTime = segment.startTime;
        setTimeout(end, segmentDuration);
      }
      else {
        video.parentNode.removeChild(video);
        video.src = '';

        self.removeUpdateFunctionWithIdentifier(renderFunctionID);

        self.scene.remove(videoMesh);

        segment.cleanup();
      }
    }
  }

};
