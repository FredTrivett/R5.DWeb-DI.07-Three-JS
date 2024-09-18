import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Figure extends THREE.Group {
    constructor(params) {
        super();
        this.params = {
            x: 0,
            y: 0, // Vertical position
            z: 0,
            ry: 0 // Rotation around Y-axis
        };
        this.position.set(this.params.x, this.params.y, this.params.z);

        this.mixer = null; // Animation mixer
        this.actions = {}; // Store animation actions
        this.state = "Idle"; // Default state
        this.onAnimationFinished = null; // Callback for when an animation finishes
        this.isJumping = false; // Flag to prevent multiple jumps
        this.isThumbsUp = false; // Flag to manage thumbs up state

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
            if (this.states.includes(clip.name)) {
                const action = this.mixer.clipAction(clip);
                this.actions[clip.name] = action;

                // Configure certain animations
                if (clip.name === "Jump" || clip.name === "ThumbsUp") {
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                }
            }
        });

        // Event listener for animation finish
        this.mixer.addEventListener('finished', () => {
            if (this.state === "Jump") {
                this.isJumping = false; // Reset jumping flag
            }
            if (this.state === "ThumbsUp") {
                this.isThumbsUp = false; // Reset thumbs up flag
            }
            this.fadeToAction("Idle");
            if (this.onAnimationFinished) {
                this.onAnimationFinished();
                this.onAnimationFinished = null; // Reset after calling
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
                if (previousAction) {
                    previousAction.fadeOut(duration);
                }
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
    }

    walk(direction) {
        const speed = 0.05; // Adjusted speed
        this.params.x += speed * Math.sin(this.params.ry) * direction;
        this.params.z += speed * Math.cos(this.params.ry) * direction;
        this.fadeToAction("Running");
    }

    jump() {
        if (this.state !== "Jump") {
            this.fadeToAction("Jump", 0.3);
            // Simulate jump motion by animating this.params.y
            gsap.to(this.params, {
                y: 2, // Jump up to y = 2
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.out",
                onComplete: () => {
                    this.params.y = 0; // Reset to ground level
                }
            });
        }
    }

    thumbsUp() {
        if (!this.isThumbsUp) {
            this.isThumbsUp = true; // Prevent overlapping thumbs up animations
            this.fadeToAction("ThumbsUp", 0.2);

            // Adjust playback speed to make the thumbs up animation longer
            const action = this.actions["ThumbsUp"];
            if (action) {
                action.timeScale = 0.5; // Slow down the animation to make it last longer
            }
        }
    }

    rotate(direction) {
        const rotationSpeed = 0.05;
        this.params.ry += direction * rotationSpeed;
    }
}
