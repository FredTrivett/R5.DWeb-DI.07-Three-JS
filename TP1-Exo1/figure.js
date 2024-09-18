import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Figure extends THREE.Group {
    constructor(params) {
        super();
        this.params = {
            x: 0,
            y: 0, // Adjusted to 0 since GLTF models often have their own origin
            z: 0,
            ry: 0,
            headRotation: 0,
            leftEyeScale: 1
        };
        this.position.set(this.params.x, this.params.y, this.params.z);

        this.mixer = null; // Animation mixer
        this.actions = {}; // Store animation actions
        this.state = "Idle"; // Default state

        // Load the GLTF model
        const loader = new GLTFLoader();
        loader.load('RobotExpressive.glb', (gltf) => {
            // Add model to the scene
            this.add(gltf.scene);
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            // Load animations
            this.loadAnimations(gltf.scene, gltf.animations);
        }, undefined, (error) => {
            console.error('An error happened', error);
        });
    }

    loadAnimations(model, animations) {
        this.mixer = new THREE.AnimationMixer(model);

        // List of animations to consider
        this.states = ["Idle", "Running", "Jump", "ThumbsUp"];

        // Set up animations
        animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            this.actions[clip.name] = action;

            // Configure certain animations
            if (clip.name === "Jump" || clip.name === "Death") {
                action.clampWhenFinished = true;
                action.loop = THREE.LoopOnce;
            }
        });

        // Play the idle animation
        this.fadeToAction("Idle");
    }

    fadeToAction(name, duration = 0.5) {
        if (this.actions[name]) {
            const previousAction = this.actions[this.state];
            const newAction = this.actions[name];

            if (previousAction !== newAction) {
                previousAction.fadeOut(duration);
                newAction
                    .reset()
                    .setEffectiveTimeScale(1)
                    .setEffectiveWeight(1)
                    .fadeIn(duration)
                    .play();
                this.state = name;
            }
        }
    }

    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
        // Update position and rotation
        this.position.set(this.params.x, this.params.y, this.params.z);
        this.rotation.y = this.params.ry;

        // Update head rotation and eye scale if necessary
        if (this.model) {
            const head = this.model.getObjectByName('Head');
            if (head) {
                head.rotation.z = this.params.headRotation;
            }

            const leftEye = this.model.getObjectByName('Eye_L');
            if (leftEye) {
                leftEye.scale.setScalar(this.params.leftEyeScale);
            }
        }
    }

    walk(direction) {
        const speed = 0.05; // Adjusted speed
        this.params.x += speed * Math.sin(this.params.ry) * direction;
        this.params.z += speed * Math.cos(this.params.ry) * direction;
        this.fadeToAction("Running");
    }

    run(direction) {
        const speed = 0.1; // Faster speed for running
        this.params.x += speed * Math.sin(this.params.ry) * direction;
        this.params.z += speed * Math.cos(this.params.ry) * direction;
        this.fadeToAction("Running");
    }

    rotate(direction) {
        const rotationSpeed = 0.05;
        this.params.ry += direction * rotationSpeed;
    }
}
