class Spring {
    constructor(_m1, _m2) {
        this.m1 = _m1;
        this.m2 = _m2;
        this.restLength = dist(_m1.position.x, _m1.position.y,
            _m2.position.x, _m2.position.y);
    }
    applyConstraint() {
        let d = this.m2.position.copy();
        d.sub(this.m1.position);
        let m = (d.mag() - this.restLength) / this.restLength;
        d.mult(m * 2);
        d.mult(stiffness);
        d.mult(0.5);
        this.m1.velocity.add(d);
        this.m2.velocity.sub(d);
    }
    display() {
        line(this.m1.position.x, this.m1.position.y,
            this.m2.position.x, this.m2.position.y);
    }

}