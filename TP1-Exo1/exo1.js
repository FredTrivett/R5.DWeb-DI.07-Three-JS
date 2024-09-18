import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import Figure from './Figure.js'; // Import the Figure class

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// Fog
scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

// Light
let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(50, 100, 10);
light.target.position.set(0, 0, 0);
scene.add(light);
const dlHelper = new THREE.DirectionalLightHelper(light);
scene.add(dlHelper);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 50;
light.shadow.camera.far = 150;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
const camHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(camHelper);

// Plane
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xcbcbcb,
    })
);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Grid helper
const gridHelper = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
camera.position.set(10, 10, 20);
scene.add(camera);

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Stats
const container = document.getElementById('container');
const stats = new Stats();
container.appendChild(stats.dom);

// GUI
const gui = new GUI();
const params = {
    showHelpers: true
};
gui.add(params, "showHelpers");

// Create the GLTF Figure instance
const figure = new Figure();
scene.add(figure);

// Handle keyboard input
let leftKeyIsDown = false;
let rightKeyIsDown = false;
let upKeyIsDown = false;
let shiftKeyIsDown = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        leftKeyIsDown = true;
    }
    if (event.key === 'ArrowRight') {
        rightKeyIsDown = true;
    }
    if (event.key === 'ArrowUp') {
        upKeyIsDown = true;
    }
    if (event.key === 'Shift') {
        shiftKeyIsDown = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
        leftKeyIsDown = false;
    }
    if (event.key === 'ArrowRight') {
        rightKeyIsDown = false;
    }
    if (event.key === 'ArrowUp') {
        upKeyIsDown = false;
        figure.fadeToAction("Idle"); // Switch back to idle animation
    }
    if (event.key === 'Shift') {
        shiftKeyIsDown = false;
    }
});

// Movement speeds
let rySpeed = 0;
let walkSpeed = 0;

// GSAP ticker for the main loop
gsap.ticker.add(() => {
    axesHelper.visible = params.showHelpers;
    dlHelper.visible = params.showHelpers;
    camHelper.visible = params.showHelpers;
    gridHelper.visible = params.showHelpers;

    // Handle rotation and movement
    if (leftKeyIsDown) {
        rySpeed += 0.02;
    }
    if (rightKeyIsDown) {
        rySpeed -= 0.02;
    }
    if (upKeyIsDown) {
        walkSpeed += shiftKeyIsDown ? 0.2 : 0.1; // Adjust speed based on shift key
        if (shiftKeyIsDown) {
            figure.run(1); // Run forward if shift is pressed
        } else {
            figure.walk(1); // Walk forward
        }
    }

    // Apply gradual slowdown to rotation and movement
    figure.params.ry += rySpeed;
    rySpeed *= 0.96; // Smooth deceleration for rotation

    figure.params.x += walkSpeed * Math.sin(figure.params.ry);
    figure.params.z += walkSpeed * Math.cos(figure.params.ry);
    walkSpeed *= 0.96; // Smooth deceleration for movement

    // Update figure
    const delta = gsap.ticker.deltaRatio();
    figure.update(delta);

    // Update controls and stats
    controls.update();
    stats.update();

    // Render the scene
    renderer.render(scene, camera);
});
