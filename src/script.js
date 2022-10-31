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
  FloatType,
  PMREMGenerator,
  Group,
  Vector3,
  Clock,
} from "https://cdn.skypack.dev/three@0.137";

import { OrbitControls } from "https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls";
import { RGBELoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader";
import { GLTFLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/GLTFLoader";

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
  let pmrem = new PMREMGenerator(renderer);
  let envmapTexture = await new RGBELoader()
    .setDataType(FloatType)
    .loadAsync("/assets/old_room_2k.hdr");
  let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

  let textures = {
    bump: await new TextureLoader().loadAsync("/assets/earthbump.jpg"),
    map: await new TextureLoader().loadAsync("/assets/earthmap.jpg"),
    spec: await new TextureLoader().loadAsync("/assets/earthspec.jpg"),
    planeTrailMask: await new TextureLoader().loadAsync("/assets/mask.png"),
  };

  let plane = (await new GLTFLoader().loadAsync("/assets/plane/scene.glb"))
    .scene.children[0];

  let planesData = [
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
    makePlane(plane, textures.planeTrailMask, envMap, scene),
  ];

  let sphere = new Mesh(
    new SphereGeometry(10, 70, 70),
    new MeshPhysicalMaterial({
      map: textures.map,
      roughnessMap: textures.spec,
      bumpMap: textures.bump,
      bumpScale: 0.5,
      envMap,
      envMapIntensity: 0.4,
      sheen: 1,
      sheenRoughness: 0.75,
      sheenColor: new Color("#ff8a00").convertSRGBToLinear(),
      clearcoat: 0.5,
    })
  );

  sphere.rotation.y += Math.PI * 1.25;
  sphere.receiveShadow = true;
  scene.add(sphere);

  let clock = new Clock();

  renderer.setAnimationLoop(() => {
    let delta = clock.getDelta();

    planesData.forEach((planeData) => {
      let plane = planeData.group;

      plane.position.set(0, 0, 0);
      plane.rotation.set(0, 0, 0);
      plane.updateMatrixWorld();

      planeData.rot += delta * Math.random() * 3.5;
      plane.rotateOnAxis(planeData.randomAxis, planeData.randomAxisRot); // random axis
      plane.rotateOnAxis(new Vector3(0, 1, 0), planeData.rot); // y-axis rotation
      plane.rotateOnAxis(new Vector3(0, 0, 1), planeData.rad); // this decides the radius
      plane.translateY(planeData.yOff);
      plane.rotateOnAxis(new Vector3(1, 0, 0), +Math.PI * 0.5);
    });

    controls.update();
    renderer.render(scene, camera);
  });
})();

function nr() {
  return Math.random() * 2 - 1;
}

const makePlane = (planeMesh, trailTexture, envMap, scene) => {
  let plane = planeMesh.clone();
  plane.scale.set(0.001, 0.001, 0.001);
  plane.position.set(0, 0, 0);
  plane.rotation.set(0, 0, 0);
  plane.updateMatrixWorld();

  plane.traverse((object) => {
    if (object instanceof Mesh) {
      object.material.envMap = envMap;
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  let group = new Group();
  group.add(plane);

  scene.add(group);

  return {
    group,
    rot: Math.random() * Math.PI * 2.0,
    rad: Math.random() * Math.PI * 0.45 + 0.05,
    yOff: 10.5 + Math.random() * 1.0,
    randomAxis: new Vector3(nr(), nr(), nr()).normalize(),
    randomAxisRot: Math.random() * Math.PI * 2,
  };
};
