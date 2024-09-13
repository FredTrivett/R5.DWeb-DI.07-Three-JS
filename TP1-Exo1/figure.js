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

    update() {
        this.position.y = this.params.y;
        this.position.x = this.params.x;
        this.position.z = this.params.z;

        this.rotation.y = this.params.ry;
    }
}