const Physics = {
  maxPower: 0.2,
  maxReverse: 0.05, //0.05;
  powerFactor: 0.0005, //0.001;
  reverseFactor: 0.01, //0.0005;
  engineBrakingFactor: 0.0005,
  brakingFactor: 0.005,
  underSteerFactor: 0.001,
  drag: 0.95,
  angularDrag: 0.9, //0.95;
  turnSpeed: 0.002, //0.002
};

export default class Car {
  constructor(x = 0,
              y = 0,
              angle = 0,
              shade = 0.6,
              width = 20,
              length = 40,
              tyreWidth = 5,
              scale = 1) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.width = width;
    this.length = length;
    this.shade = shade;
    this.tyreWidth = tyreWidth;
    this.scale = scale;

    this.xVelocity = 0;
    this.yVelocity = 0;
    this.velocity = 0;
    this.power = 0;
    this.reverse = 0;
    this.direction = 1;
    this.angularVelocity = 0;
    this.isThrottling = false;
    this.isReversing = false;
    this.isRunning = false;
    
    this.img = document.querySelector('.car');
    this.makeTyreTexture();    
  }
  
  makeTyreTexture() {
    const canvasTemp = document.createElement("canvas");
    canvasTemp.width = this.width;
    canvasTemp.height = this.length;
    this.tCtx = canvasTemp.getContext("2d");
    this.drawTyreMark(this.tCtx);
  }

  throttle(input) {
    this.isThrottling = input;
  }

  brake(input) {
    this.isReversing = input;
  }
  
  steerLeft(input) {
    this.isTurningLeft = input;
  }
  
  steerRight(input) {
    this.isTurningRight = input;
  }    

  update(fps = 60) {
    this.updatePower();
    this.canTurn = this.power > 0.005 || this.reverse > 0.005;

    this.updateAngularVelocity();
    this.updateVelocity();

    this.x += (this.xVelocity / fps * 60) ;
    this.y -= (this.yVelocity / fps * 60) ;
    this.angle += this.angularVelocity;
    
    this.angle = Math.atan2(Math.sin(this.angle), Math.cos(this.angle));
    // if(this.angle > Math.PI * 2)
    //   this.angle -= Math.PI * 2;
    // if(this.angle < -Math.PI * 2)
    //   this.angle += Math.PI * 2;
  }

  updatePower() {
    if (this.isThrottling)
      this.power += Physics.powerFactor * this.isThrottling;
    else 
      this.power -= Physics.engineBrakingFactor;
    if (this.isReversing) 
      this.reverse += Physics.reverseFactor;
    else 
      this.reverse -= Physics.engineBrakingFactor;
    
    if(this.power > 0 || this.reverse > 0)
      this.isRunning = true;
    else 
      setTimeout(() => this.isRunning = false, 5000);

    this.power = Math.max(0, Math.min(Physics.maxPower, this.power));
    this.reverse = Math.max(0, Math.min(Physics.maxReverse, this.reverse));
    this.direction = this.power > this.reverse ? 1 : -1;

    if ((this.direction === 1) & this.isReversing)
      this.power -= Physics.brakingFactor;
  }

  updateAngularVelocity() {
    if (this.isTurningLeft) {
      this.angularVelocity -=
        this.direction * Physics.turnSpeed * this.isTurningLeft;
    }
    if (this.isTurningRight) {
      this.angularVelocity +=
        this.direction * Physics.turnSpeed * this.isTurningRight;
    }
    if (this.isTurningRight || this.isTurningLeft)
      this.angularVelocity -=
        this.power * Physics.underSteerFactor * this.direction;
    this.angularVelocity *= Physics.angularDrag;
  }

  updateVelocity() {
    this.xVelocity -= Math.sin(this.angle) * (this.power - this.reverse);
    this.yVelocity -= Math.cos(this.angle) * (this.power - this.reverse);
    this.xVelocity *= Physics.drag;
    this.yVelocity *= Physics.drag;
    this.velocity =
      Math.abs(this.xVelocity) ** 2 + Math.abs(this.yVelocity) ** 2;
  }

  updateControls(up, down, left, right) {
    this.isThrottling = up;
    this.isReversing = down;
    this.isTurningLeft = this.isTurningRight = false;
    if (left && this.canTurn) {
      this.isTurningLeft = true;
    }
    if (right && this.canTurn) {
      this.isTurningRight = true;
    }
  }

  renderDOM(offset = {x: 0, y: 0}) {
    // this.img.style.left = this.x - this.width / 2 + offset.x +'px';
    // this.img.style.top = this.y - this.length / 2 + offset.y + 'px';
    // this.img.style.left = this.x + offset.x +'px';
    // this.img.style.top = this.y + offset.y + 'px';
    //translate(-${this.width / 2}px, -${this.length / 2}px) 
    this.img.style.transform = `translateX(${this.x - this.width / 2 + offset.x}px)
      	                        translateY(${this.y - this.length / 2 + offset.y}px)
      	                        rotate(${this.angle * 180 / Math.PI}deg)
                                scaleY(-1)
                                scaleX(-1)`;
                                // translateX(-${this.width / 2}px)
      	                        // translateY(-${this.length / 2}px)`;
  }
  
  render(ctx, offset = {x: 0, y: 0}) {
    if(!ctx) {
      this.renderDOM(offset);
      return;
    }
    ctx.save();
    // ctx.fillStyle = this.color;
    ctx.translate((this.x + this.width / 2 + offset.x) / this.scale, (this.y + this.length / 2 + offset.y) / this.scale);
    // ctx.translate(this.x + offset.x, this.y + offset.y);
    ctx.rotate(this.angle);
    if(!this.img)
      ctx.fillRect(0, 0, this.width / this.scale, this.length / this.scale);
    else {
      ctx.scale(1 / this.scale, -1 / this.scale);
      // console.log(this.shade)
      ctx.filter = `brightness(${this.shade}) drop-shadow(4px 3px 2px #444)`;
      ctx.drawImage(this.img, -8, -30);
      
      // ctx.globalCompositeOperation = 'source-in';
      // ctx.fillStyle = this.color;      
      // ctx.fillRect(-4, -30, 24, 34);
    }
    ctx.restore();
  }

  renderTyreMarks(ctx, offset = {x: 0, y: 0}) {
    ctx.save();
    // ctx.translate(this.x + offset.x, this.y + offset.y);
    // ctx.translate(this.x + this.width / 2 + offset.x, this.y + this.length / 2 + offset.y);
    ctx.translate((this.x + this.width / 2 + offset.x) / 4, (this.y + this.length / 2 + offset.y) / 4);

    ctx.rotate(this.angle);
    // this.drawTyreMark(ctx);
    ctx.drawImage(this.tCtx.canvas, 0, 0);
    ctx.restore();
  }
  
  drawTyreMark(tCtx) {
    tCtx.fillRect(0, 0, this.tyreWidth / this.scale, this.tyreWidth / this.scale);
    tCtx.fillRect(
      this.width / this.scale - this.tyreWidth / this.scale,
      0,
      this.tyreWidth / this.scale,
      this.tyreWidth / this.scale
    );
  }

  debug(ctx) {
    ctx.font = "12px Arial";
    ctx.fillText("Power: " + Math.round(this.power * 100) / 100 + "   Reverse: " + Math.round(this.reverse * 100) / 100, 10, 20);
    ctx.fillText("Velocity: " + Math.round(this.velocity * 100) / 100, 10, 40);
    ctx.fillText("Angular velocity: " + Math.round(this.angularVelocity * 100) / 100, 10, 60);
    ctx.fillText("Can turn: " + this.canTurn, 10, 80);
    ctx.fillText("xVelocity: " + Math.round(this.xVelocity * 100), 10, 100);
    ctx.fillText("yVelocity: " + Math.round(this.yVelocity * 100), 10, 120);
    ctx.fillText("Angle: " + Math.round(this.angle * 180 / Math.PI), 10, 140);
    ctx.fillText("Angle to WP: " + Math.round(this.angleToWP * 180 / Math.PI), 10, 160);
    ctx.fillText("x: " + Math.round(this.x), 10, 180);
    ctx.fillText("y: " + Math.round(this.y), 10, 200);
  }
}
