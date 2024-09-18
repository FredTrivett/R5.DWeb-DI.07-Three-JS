import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Figure extends THREE.Group {
    constructor(params) {
        super();
        this.params = {
            x: 0,
            y: 0,
            z: 0,
            ry: 0,
        }
        this.position.x = this.params.x;
        this.position.y = this.params.y;
        this.position.z = this.params.z;

        var self = this;
        const loader = new GLTFLoader();
        loader.load('RobotExpressive.glb', (gltf) => {
            self.add(gltf.scene);
        }, undefined, function (e) {
            console.error(e);
        });
    }

    loadAnimation(model, animation) {
        this.mixer = new THREE.AnimationMixer(model);

        this.states = ["Idle", "Running", "Jump", "ThumbsUp"];

        this.actions = {};

        for (let i = 0; i < this.states.length; i++) {
            const clip = animations[i];
            if (this.state.includes(clip.name)) {
                const action = this.mixer.clipAction(clip);
                this.actions[clip.name] = action;
                if (clip.name === "Jump" || clip.name === "ThumbsUp") {
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                }
            }
        }

        this.state = "Idle";
        this.actions[this.state].play();
    }

    update(dt) {
        // Vertical position
        this.position.y = this.params.y;
        // Ground position
        this.position.x = this.params.x;
        this.position.z = this.params.z;

        this.rotation.y = this.params.ry;

        this.mixer.update(dt);
    }
}