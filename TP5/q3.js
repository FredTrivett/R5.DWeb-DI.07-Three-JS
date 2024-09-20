const deltaT = 0.1;
const gravity = 1;
const damping = 0.99;
const stiffness = 0.99;
const friction = 0.005;
const maxVel = 150;

let masses = [];
let springs = [];

function setup() {
    createCanvas(windowWidth, windowHeight);

    let centerX = windowWidth / 2;
    let centerY = windowHeight / 2;
    let radius = 100;
    let numPoints = 8;

    for (let i = 0; i < numPoints; i++) {
        let angle = TWO_PI / numPoints * i;
        let x = centerX + radius * cos(angle);
        let y = centerY + radius * sin(angle);
        masses.push(new Mass(x, y));
    }

    for (let i = 0; i < masses.length; i++) {
        for (let j = i + 1; j < masses.length; j++) {
            springs.push(new Spring(masses[i], masses[j]));
        }
    }
}

function draw() {
    background(255);

    for (let i = 0; i < masses.length; i++) {
        masses[i].updatePosition();
        masses[i].display();
    }

    for (let i = 0; i < springs.length; i++) {
        springs[i].applyConstraint();
        springs[i].display();
    }
}

function mousePressed() {
    let mousePos = createVector(mouseX, mouseY);
    for (let i = 0; i < masses.length; i++) {
        let force = p5.Vector.sub(mousePos, masses[i].position);
        force.setMag(0.5); // Adjust the magnitude of the force