import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Figure extends THREE.Group {
    constructor(params) {
        super();
        this.params = {
            x: 0,
            y: 1.4,
            z: 0,
            ry: 0,
        };
        this.position.set(this.params.x, this.params.y, this.params.z);

        this.mixer = null; // Initialize mixer
        this.actions = {}; // Store animation actions
        this.state = "Idle"; // Default state to idle

        const loader = new GLTFLoader();
        loader.load('RobotExpressive.glb', (gltf) => {
            this.add(gltf.scene);
            this.loadAnimation(gltf.scene, gltf.animations); // Load animations
        }, undefined, function (e) {
            console.error(e);
        });
    }

    loadAnimation(model, animations) {
        this.mixer = new THREE.AnimationMixer(model);
        this.states = ["Idle", "Walking", "Running", "Jump", "ThumbsUp"]; // List of possible states

        // Set up animations
        for (let i = 0; i < animations.length; i++) {
            const clip = animations[i];
            if (this.states.includes(clip.name)) {
                const action = this.mixer.clipAction(clip);
                this.actions[clip.name] = action;

                // Set specific behaviors for some animations
                if (clip.name === "Jump" || clip.name === "ThumbsUp") {
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                }
            }
        }

        // Play the idle animation by default
        this.fadeToAction("Idle");
    }

    fadeToAction(name, duration = 0.5) {
        if (this.actions[name] && this.state !== name) {
            // Fade out the current action
            if (this.actions[this.state]) {
                this.actions[this.state].fadeOut(duration);
            }

            // Fade in the new action
            this.state = name;
            this.actions[this.state].reset().fadeIn(duration).play();
        }
    }

    update(delta) {
        if (!this.mixer) return; // Exit if the mixer isn't defined

        // Update the position and rotation of the figure
        this.position.set(this.params.x, this.params.y, this.params.z);
        this.rotation.y = this.params.ry;

        // Update animations
        this.mixer.update(delta);
    }

    // Movement and animation methods
    walk(direction) {
        const speed = 0.1;
        this.params.x += speed * Math.sin(this.params.ry) * direction;
        this.params.z += speed * Math.cos(this.params.ry) * direction;
        this.fadeToAction("Walking");
    }

    run(direction) {
        const speed = 0.2; // Faster speed for running
        this.params.x += speed * Math.sin(this.params.ry) * direction;
        this.params.z += speed * Math.cos(this.params.ry) * direction;
        this.fadeToAction("Running");
    }

    rotate(direction) {
        const rotationSpeed = 0.05;
        this.params.ry += direction * rotationSpeed;
    }
}
