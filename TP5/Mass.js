class Mass {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(random(-20, 20), random(20));
    }
    updatePosition() {
        this.velocity.y += gravity;
        this.velocity.mult(damping);
        this.velocity.limit(maxVel);
        this.position.x += this.velocity.x * deltaT;
        this.position.y += this.velocity.y * deltaT;
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x = 0;
            this.velocity.y *= friction;
        }
        if (this.position.x > width) {
            this.position.x = width;
            this.velocity.x = 0;
            this.velocity.y *= friction;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.velocity.x *= friction;
        }
        if (this.position.y > height) {
            this.position.y = height;
            this.velocity.y = 0;
            this.velocity.x *= friction;
        }
    }
    display() {
        fill(0);
        circle(this.position.x, this.position.y, 10);
    }
}
