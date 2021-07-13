import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { CubeTextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

//Texture
const cubeTextureLoader = new THREE.CubeTextureLoader();

//Debugger
const gui = new dat.GUI();
const debugObject = {};

//Canvas
const canvas = document.querySelector(".webgl");

//Scene
const scene = new THREE.Scene();

//Update all material
const updateMaterial = () => {
	scene.traverse((child) => {
		if (
			child instanceof THREE.Mesh &&
			child.material instanceof THREE.MeshStandardMaterial
		) {
			// child.material.envMap = environmentMapTexture;
			child.material.envMapIntensity = debugObject.envMapIntensity;
			child.material.needsUpdate = true;
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
};

//EnvironmentMap
const environmentMapTexture = cubeTextureLoader.load([
	"/textures/environmentMaps/0/px.jpg",
	"/textures/environmentMaps/0/nx.jpg",
	"/textures/environmentMaps/0/py.jpg",
	"/textures/environmentMaps/0/ny.jpg",
	"/textures/environmentMaps/0/pz.jpg",
	"/textures/environmentMaps/0/nz.jpg",
]);
environmentMapTexture.encoding = THREE.sRGBEncoding;
scene.background = environmentMapTexture;
scene.environment = environmentMapTexture;

debugObject.envMapIntensity = 5;
gui
	.add(debugObject, "envMapIntensity")
	.min(0)
	.max(10)
	.step(0.001)
	.onChange(updateMaterial);

//Models
const gltfLoader = new GLTFLoader();

gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
	gltf.scene.scale.set(10, 10, 10);
	gltf.scene.position.set(0, -4, 0);
	gltf.scene.rotation.y = Math.PI * 0.5;
	scene.add(gltf.scene);

	gui
		.add(gltf.scene.rotation, "y")
		.min(-Math.PI)
		.max(Math.PI)
		.step(0.001)
		.name("rotation");

	updateMaterial();
});

//Cursor
const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener("mousemove", (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = -(event.clientY / sizes.height - 0.5);
});

//Objects
const testSphere = new THREE.Mesh(
	new THREE.SphereBufferGeometry(1, 32, 32),
	new THREE.MeshStandardMaterial()
);

// scene.add(testSphere);

//Lights

const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(0.25, 3, -2.25);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);

gui
	.add(directionalLight, "intensity")
	.min(0)
	.max(10)
	.step(0.001)
	.name("lightIntensity");
gui
	.add(directionalLight.position, "x")
	.min(-5)
	.max(5)
	.step(0.001)
	.name("lightX");
gui
	.add(directionalLight.position, "y")
	.min(-5)
	.max(5)
	.step(0.001)
	.name("lightY");
gui
	.add(directionalLight.position, "z")
	.min(-5)
	.max(5)
	.step(0.001)
	.name("lightZ");

//sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	//Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	//Update Camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	//Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("dblclick", () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});

//Camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 4;
camera.position.y = 1;
camera.position.z = -4;
// camera.lookAt(mesh.position);
scene.add(camera);

//Renderer
const renderer = new THREE.WebGLRenderer({
	// canvas: canvas
	canvas,
	antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sizes.width, sizes.height);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

gui
	.add(renderer, "toneMapping", {
		No: THREE.NoToneMapping,
		Linear: THREE.LinearToneMapping,
		Reinhard: THREE.ReinhardToneMapping,
		Cineon: THREE.CineonToneMapping,
		ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
	})
	.onFinishChange(() => {
		renderer.toneMapping = Number(renderer.toneMapping);
		updateMaterial();
	});

gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// //Clock
const clock = new THREE.Clock();
let oldElapsed = 0;

//Animation
const tick = () => {
	//clock sec
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsed;
	oldElapsed = elapsedTime;

	//Update controls
	controls.update();

	//Renderer
	renderer.render(scene, camera);

	window.requestAnimationFrame(tick);
};

tick();
