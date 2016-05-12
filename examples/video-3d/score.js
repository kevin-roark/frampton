
var THREE = require('three');
var frampton = require('../dist/web-frampton');
var WebRenderer3D = require('../dist/renderer/web-renderer-3d');
var OrbitControls = require('../dist/threejs/orbit-controls');
var mediaConfig = require('./numbers_config.json');

var renderer = new WebRenderer3D({
  mediaConfig: mediaConfig,
  videoSourceMaker: function(filename) {
    return '/examples/numbers/' + filename;
  }
});

renderer.renderer.shadowMap.enabled = true;
renderer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.renderer.gammaInput = true;
renderer.renderer.gammaOutput = true;
renderer.renderer.antialias = true;

renderer.camera.position.z = 500;

var controls = new OrbitControls(renderer.camera, renderer.renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

renderer.addUpdateFunction(function() {
  controls.update();
});

var ground = createGround();
ground.position.set(0, -50, 0);
renderer.scene.add(ground);

var spt = createSpotLight();
spt.position.set(0, 250, -50);
renderer.scene.add(spt);
//renderer.scene.add(spt.shadowCameraHelper); // add this to see shadow helper

scheduleSegment(-200);
scheduleSegment(0);
scheduleSegment(200);

function scheduleSegment(x) {
  var video = frampton.util.choice(mediaConfig.videos);

  var segment = new frampton.VideoSegment(video);
  segment.loop = true;
  segment.threeOptions = {
    videoSourceWidth: 1920, videoSourceHeight: 1080,
    geometryProvider: (videoMeshWidth, videoMeshHeight) => {
      return new THREE.BoxGeometry(videoMeshWidth, videoMeshHeight, 50);
    },
    meshConfigurer: function(mesh) {
      mesh.position.set(x, 10, 0);
      mesh.castShadow = true;
    }
  };

  renderer.scheduleSegmentRender(segment, 3000);
}

function createGround() {
  var geometry = new THREE.PlaneGeometry(1000, 1000);
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  var material = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    emissive: 0x777777,
    side: THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;

  return mesh;
}

function createSpotLight() {
  var spt = new THREE.SpotLight(0xffaaaa, 1.5);
  spt.castShadow = true;
  spt.shadow.camera.near = 0.1;
  spt.shadow.camera.far = 20000;
  spt.shadow.mapSize.width = spt.shadow.mapSize.height = 1024;
  spt.shadowCameraHelper = new THREE.CameraHelper(spt.shadow.camera); // colored lines
  spt.angle = 1.0;
  spt.exponent = 2.0;
  spt.penumbra = 0.15;
  spt.decay = 1.25;
  spt.distance = 500;

  return spt;
}
