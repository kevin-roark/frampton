'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebRenderer = require('./web-renderer');
var THREE = require('three');
var TWEEN = require('tween.js');

module.exports = function (_WebRenderer) {
  _inherits(WebRenderer3D, _WebRenderer);

  function WebRenderer3D(options) {
    _classCallCheck(this, WebRenderer3D);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebRenderer3D).call(this, options));

    var rendererProvider = options.rendererProvider;
    var sceneProvider = options.sceneProvider;
    var cameraProvider = options.cameraProvider;


    if (!rendererProvider) rendererProvider = function rendererProvider() {
      var renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xffffff, 1);
      return renderer;
    };
    _this.renderer = rendererProvider();

    if (!sceneProvider) sceneProvider = function sceneProvider() {
      return new THREE.Scene();
    };
    _this.scene = sceneProvider();

    if (!cameraProvider) cameraProvider = function cameraProvider() {
      return new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    };
    _this.camera = cameraProvider();
    _this.scene.add(_this.camera);

    _this.ambientLight = new THREE.AmbientLight(0x404040);
    _this.scene.add(_this.ambientLight);

    _this.domContainer.appendChild(_this.renderer.domElement);

    window.addEventListener('resize', _this.resize.bind(_this));
    _this.resize();
    return _this;
  }

  _createClass(WebRenderer3D, [{
    key: 'resize',
    value: function resize() {
      if (this.renderer) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }

      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }, {
    key: 'update',
    value: function update() {
      _get(Object.getPrototypeOf(WebRenderer3D.prototype), 'update', this).call(this);

      if (this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }
    }
  }, {
    key: 'renderVideoSegment',
    value: function renderVideoSegment(segment, _ref) {
      var _ref$offset = _ref.offset;
      var offset = _ref$offset === undefined ? 0 : _ref$offset;

      var self = this;

      var _segment$threeOptions = segment.threeOptions;
      var _segment$threeOptions2 = _segment$threeOptions.videoMeshWidth;
      var videoMeshWidth = _segment$threeOptions2 === undefined ? 150 : _segment$threeOptions2;
      var _segment$threeOptions3 = _segment$threeOptions.videoSourceWidth;
      var videoSourceWidth = _segment$threeOptions3 === undefined ? 853 : _segment$threeOptions3;
      var _segment$threeOptions4 = _segment$threeOptions.videoMeshHeight;
      var videoMeshHeight = _segment$threeOptions4 === undefined ? 75 : _segment$threeOptions4;
      var _segment$threeOptions5 = _segment$threeOptions.videoSourceHeight;
      var videoSourceHeight = _segment$threeOptions5 === undefined ? 480 : _segment$threeOptions5;
      var meshConfigurer = _segment$threeOptions.meshConfigurer;
      var geometryProvider = _segment$threeOptions.geometryProvider;

      if (!geometryProvider) geometryProvider = function geometryProvider() {
        return new THREE.PlaneGeometry(videoMeshWidth, videoMeshHeight);
      };

      var video = document.createElement('video');
      video.preload = true;

      var filename = video.canPlayType('video/mp4').length > 0 ? segment.filename : segment.extensionlessName() + '.webm';
      video.src = this.videoSourceMaker(filename);

      video.volume = segment.volume;
      segment.addChangeHandler('volume', function (volume) {
        video.volume = volume;
      });

      video.currentTime = segment.startTime;

      video.playbackRate = segment.playbackRate;
      segment.addChangeHandler('playbackRate', function (playbackRate) {
        video.playbackRate = playbackRate;
      });

      var videoCanvas = document.createElement('canvas');
      videoCanvas.width = videoSourceWidth;videoCanvas.height = videoSourceHeight;

      var videoContext = videoCanvas.getContext('2d');
      videoContext.fillStyle = '#000000'; // background color if no video present
      videoContext.fillRect(0, 0, videoMeshWidth, videoMeshHeight);

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
      video.addEventListener('playing', function () {
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
          new TWEEN.Tween(videoMaterial).to({ opacity: segment.opacity }, videoFadeDuration).start();

          // fade out
          setTimeout(function () {
            new TWEEN.Tween(videoMaterial).to({ opacity: 0 }, videoFadeDuration).start();
          }, segmentDuration - videoFadeDuration);
        } else if (segment.opacity < 1) {
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
        } else {
          video.parentNode.removeChild(video);
          video.src = '';

          self.removeUpdateFunctionWithIdentifier(renderFunctionID);

          self.scene.remove(videoMesh);

          segment.cleanup();
        }
      }
    }
  }]);

  return WebRenderer3D;
}(WebRenderer);