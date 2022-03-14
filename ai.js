const MathUtil = {
  angleBetween: (x1, y1, x2, y2) => {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return  Math.atan2(dy, dx)// * 180 / Math.PI;  
  }
};

export default class AI {
  
  constructor(cars, points) {
    this.cars = cars;
    this.points = points;
    this.cars.forEach(car => {
      car.nextWP = 0;
    });
  }
  
  drive(car) {    
    if(car.collisionTimer > 0) {
      car.collisionTimer--;
      return;
    }
    
    let wp = this.points[car.nextWP];
    
    const angleToWP = MathUtil.angleBetween(car.x, car.y, wp.x, wp.y);
    const angleCar = car.angle / Math.PI;
    
    let diff = Math.abs(angleToWP - angleCar);
    
    // console.log(diff);
    
    if(diff > 3.5)
      return;
    
    let steerNeeded = diff > 0.1;
    
    if(steerNeeded && angleToWP > angleCar) {
      car.steerLeft(true);
      car.steerRight(false);
    }
    else if(steerNeeded && angleToWP < angleCar) {
      car.steerLeft(false);
      car.steerRight(true);
    }
    else {
      car.steerLeft(false);
      car.steerRight(false);      
    }
      
    if(Math.abs(car.angularVelocity) > 0.02 && car.velocity > 0) {
      car.throttle(false);
      car.brake(true);      
    }
    else if(!car.warning && Math.abs(car.angularVelocity) < 0.01) {
      car.throttle(true);
      car.brake(false);
    }
    else {
      car.throttle(false);
      car.brake(false);
    }
  }
  
  reset() {
    this.cars.forEach(car => {
      car = null;
    });
    this.cars = [];
  }  
  
  updateCars() {
    this.cars.forEach(car1 => {
      car1.warning = false;
      car1.crash = false;
      this.cars.forEach(car2 => {
        if(car1 !== car2 && car1.nextWP && car2.nextWP && car1.nextWP === car2.nextWP) {
          const dist1 = MathUtil.angleBetween(car1.x, car1.y, car2.x, car2.y);
          const dist2 = MathUtil.angleBetween(car1.x, car1.y, this.points[car1.nextWP].x, this.points[car1.nextWP].y);
          const dist3 = MathUtil.angleBetween(car2.x, car2.y, this.points[car1.nextWP].x, this.points[car1.nextWP].y);
          if(dist1 < 50) {
            car1.crash = true;
            car2.crash = true;
          }
          else if(dist1 < 100) {
            if(dist2 > dist3) 
              car1.warning = true;
            else
              car2.warning = true;
          }          
        }          
      });  
    });    
  }
}