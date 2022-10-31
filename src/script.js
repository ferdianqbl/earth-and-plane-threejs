import {
  Scene,
  TextureLoader,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  sRGBEncoding,
  PCFSoftShadowMap,
  DirectionalLight,
  Color,
  Mesh,
  SphereGeometry,
  MeshPhysicalMaterial,
} from "https://cdn.skypack.dev/three";

import { OrbitControls } from "https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls";

const scene = new Scene();

const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);

camera.position.set(0, 15, 50);

const renderer = new WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dumpingFactor = 0.5;
controls.enableDamping = true;

document.body.appendChild(renderer.domElement);

const sunLight = new DirectionalLight(
  new Color("#FFFFFF").convertSRGBToLinear(),
  3.5
);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.right = 10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.bottom = -10;
scene.add(sunLight);

(async () => {
  let textures = {
    bump: await new TextureLoader().loadAsync("/assets/earthbump.jpg"),
    map: await new TextureLoader().loadAsync("/assets/earthmap.jpg"),
    spec: await new TextureLoader().loadAsync("/assets/earthspec.jpg"),
  };

  let sphere = new Mesh(
    new SphereGeometry(10, 70, 70),
    new MeshPhysicalMaterial({
      map: textures.map,
      roughnessMap: textures.spec,
      bumpMap: textures.bump,
      bumpScale: 0.5,
      sheen: 1,
      sheenRoughness: 0.75,
      sheenColor: new Color("#ff8a00").convertSRGBToLinear(),
      clearcoat: 0.5,
    })
  );

  sphere.receiveShadow = true;
  scene.add(sphere);

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
})();
