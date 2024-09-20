import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import Figure from './figure.js'; // Import the Figure class

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

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
    new THREE.MeshPhongMaterial({ color: 0xcbcbcb })
);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
plane.castShadow = false;
scene.add(plane);

// Grid helper
const gridHelper = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
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

// // Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

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

// GSAP timelines
let idleTimeline = gsap.timeline({ repeat: -1 });
idleTimeline.to(figure.params, {
    duration: 0.5,
    yoyo: true,
    ease: "back.in"
});

// Movement variables
let rySpeed = 0;
let walkSpeed = 0;

let leftKeyIsDown = false;
let rightKeyIsDown = false;
let upKeyIsDown = false;

let bullets = [];

// Bullet class
class Bullet extends THREE.Group {
    constructor(x, y, z, orientation) {
        super();

        // Create bullet
        const bulletMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );

        bulletMesh.castShadow = true;
        this.add(bulletMesh);

        // Set position
        this.position.set(x, y, z);

        // Orientation
        this.orientation = orientation;
    }

    update() {
        const speed = 1.1;
        this.position.x += speed * Math.sin(this.orientation);
        this.position.z += speed * Math.cos(this.orientation);
    }
}

// Event listeners
document.addEventListener('keydown', (event) => {
    if (event.key === 'a') {
        idleTimeline.pause();
        rySpeed += 0.02;
        leftKeyIsDown = true;
    }
    if (event.key === 'd') {
        idleTimeline.pause();
        rySpeed -= 0.02;
        rightKeyIsDown = true;
    }
    if (event.key === 'w') {
        idleTimeline.pause();
        walkSpeed += 0.1;
        upKeyIsDown = true;
    }
    if (event.key === ' ') { // Space bar for jump
        idleTimeline.pause();
        figure.jump();
    }
    if (event.key === 'f') {
        // Play thumbs up animation
        figure.thumbsUp();

        // Set a callback to fire the bullet after the animation finishes
        figure.onAnimationFinished = () => {
            const bullet = new Bullet(
                figure.params.x,
                figure.params.y + 1.5, // Adjusted to be at the robot's height
                figure.params.z,
                figure.params.ry
            );
            scene.add(bullet);
            bullets.push(bullet);
        };
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'a') {
        leftKeyIsDown = false;
    }
    if (event.key === 'd') {
        rightKeyIsDown = false;
    }
    if (event.key === 'w') {
        upKeyIsDown = false;
        figure.fadeToAction("Idle");
    }
});

let text = null
const fontLoader = new FontLoader();
const myFont = "helvetiker_regular.typeface.json"
const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
function createText(count) {
    scene.remove(text);
    fontLoader.load(myFont, (font) => {
        const textGeometry = new TextGeometry('shots: ' + count, {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });
        text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(-10, 10, -10);
        scene.add(text);
    });
}
createText(0);


// Main loop using gsap.ticker
gsap.ticker.add(() => {
    axesHelper.visible = params.showHelpers;
    dlHelper.visible = params.showHelpers;
    camHelper.visible = params.showHelpers;
    gridHelper.visible = params.showHelpers;

    if (leftKeyIsDown) {
        rySpeed += 0.002;
    }
    if (rightKeyIsDown) {
        rySpeed -= 0.002;
    }
    if (upKeyIsDown) {
        walkSpeed += 0.01;
    }

    if (walkSpeed >= 0.01) {
        figure.walk(1);
    } else {
        if (figure.state !== "Idle" && !upKeyIsDown) {
            figure.fadeToAction("Idle");
        }
    }

    // Update rotation and position
    figure.params.ry += rySpeed;
    rySpeed *= 0.96;

    figure.params.x += walkSpeed * Math.sin(figure.params.ry);
    figure.params.z += walkSpeed * Math.cos(figure.params.ry);
    walkSpeed *= 0.96;

    // Update bullets 
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        // Remove bullets if they go too far
        if (Math.abs(bullets[i].position.x) > 100 || Math.abs(bullets[i].position.z) > 100) {
            scene.remove(bullets[i]);
            bullets.splice(i, 1);
        }
    }

    // Update figure
    const delta = gsap.ticker.deltaRatio() * (1 / 60); // Assuming 60 FPS
    figure.update(delta);

    // Camera follows the robot
    const cameraOffset = new THREE.Vector3(0, 5, -10); // Offset from the robot
    const offsetRotated = cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), figure.params.ry);
    const desiredCameraPosition = figure.position.clone().add(offsetRotated);
    camera.position.lerp(desiredCameraPosition, 0.1); // Smoothly interpolate to new position
    camera.lookAt(figure.position);

    // Update text
    if (text) {
        const localTextPosition = new THREE.Vector3(-2, 10, -20);
        const textPosition = camera.localToWorld(localTextPosition);
        text.lookAt(camera.position);
        text.position.copy(textPosition);
    }

    renderer.render(scene, camera);

    // Update stats
    stats.update();

    // Render scene
    renderer.render(scene, camera);
});



