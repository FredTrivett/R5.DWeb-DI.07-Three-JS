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

    let m1 = new Mass(windowWidth / 2 - 50, windowHeight / 2 - 50);
    let m2 = new Mass(windowWidth / 2 + 50, windowHeight / 2 - 50);
    let m3 = new Mass(windowWidth / 2 + 50, windowHeight / 2 + 50);
    let m4 = new Mass(windowWidth / 2 - 50, windowHeight / 2 + 50);

    masses.push(m1, m2, m3, m4);

    springs.push(new Spring(m1, m2));
    springs.push(new Spring(m2, m3));
    springs.push(new Spring(m3, m4));
    springs.push(new Spring(m4, m1));
    springs.push(new Spring(m1, m3)); // Diagonal spring
    springs.push(new Spring(m2, m4)); // Diagonal spring
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