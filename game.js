//@TODO Add camera https://jsfiddle.net/931wk75n/2/
//@TODO Add particles https://modernweb.com/creating-particles-html5-canvas/

import MotorAudio from './motor-audio.js';
import Car from './car.js';
import Track from './track.js';
import tracks from './tracks.js';
import AI from './ai.js';

const scale = 4;
const cCanvas = document.querySelector('.cars');
const cCtx = cCanvas.getContext('2d');

const tCanvas = document.querySelector('.tyre-marks');
// tCanvas.transferControlToOffscreen();
const tCtx = tCanvas.getContext('2d');

const track = new Track();
const pressedKeys = {};
let mAudio = null;

window.onkeyup = (e) => {
  pressedKeys[e.keyCode] = false;
};

window.onkeydown = (e) => {
  if(!mAudio) {
    mAudio = new MotorAudio(new AudioContext());
    mAudio.restart();
  }
  pressedKeys[e.keyCode] = true;
};

const points = tracks[Math.round(Math.random(tracks.length))];

function getBounds(points) {
  const tmp = [...points];
  tmp.sort((a, b) => {
    return a.x - b.x;
  })
  const minX = tmp[0].x, maxX = tmp[tmp.length - 1].x;
  tmp.sort((a, b) => {
    return a.y - b.y;
  })
  const minY = tmp[0].y, maxY = tmp[tmp.length - 1].y;
  return [{x: minX, y: minY}, {x: maxX, y: maxY}];
}

let xOffset = 0;
let yOffset = 0;

function setup() {
  cCanvas.width = window.innerWidth;
  cCanvas.height = window.innerHeight;
  tCanvas.width = window.innerWidth;
  tCanvas.height = window.innerHeight;
  tCtx.globalAlpha = 1;
  const bounds = getBounds(points)  
  const cPoints = centerPoints(points, bounds);
  track.render(tCtx, cPoints);
  tCtx.fillStyle = 'black';
  tCtx.globalAlpha = 0.01;  
  tCtx.scale(scale, scale);
  cCtx.scale(scale, scale);  
}

setup();
const car = new Car(points[0].x - 70, points[0].y + 20, -Math.PI / 2, 0.8, 15, 30, 4, scale);
const aiCar = new Car(points[0].x - 70, points[0].y - 20, -Math.PI / 2, 0.4, 15, 30, 4, scale);
const ai = new AI([], points);

function centerPoints(points, bounds) {
  const pWidth = bounds[1].x - bounds[0].x;
  const pHeight = bounds[1].y - bounds[0].y;
  xOffset = (tCanvas.width - pWidth) / 2 - bounds[0].x; 
  yOffset = (tCanvas.height - pHeight) / 2 - bounds[0].y; 
  const cPoints = [];
  points.forEach(p => {
    cPoints.push({ x: (p.x + xOffset), y: (p.y + yOffset) });
  });
  return cPoints;
}
window.onresize = setup;

const infoEl = document.querySelector('.info');

function renderPoint(ctx, p, size, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.arc(points[p].x  / scale, points[p].y / scale, size / scale, 0, 2 * Math.PI);
  // ctx.arc(400 / scale, 100  / scale, 10, 0, 2 * Math.PI);
  ctx.stroke();
}

function step() {
  ai.updateCars();
  ai.cars.forEach(aiCar => {
    ai.drive(aiCar);
    aiCar.update(fps);
  });
  
  // ai.drive(car);
  car.updateControls(
    pressedKeys[38],
    pressedKeys[40],
    pressedKeys[37],
    pressedKeys[39]
  );
  
  car.update(fps);
  cCtx.clearRect(0, 0, cCtx.canvas.width, cCtx.canvas.height);
  
  // cCtx.setTransform(1, 0, 0, 1, 0, 0);
  // cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
  // const camX = -car.x + cCanvas.width / 2;
  // const camY = -car.y + cCanvas.height / 2;
  // cCtx.translate(camX, camY);

  car.renderTyreMarks(tCtx, {x: xOffset, y: yOffset});
  car.render(cCtx, {x: xOffset, y: yOffset});
  
  ai.cars.forEach(aiCar => {
    aiCar.renderTyreMarks(tCtx, {x: xOffset, y: yOffset});
    aiCar.render(cCtx, {x: xOffset, y: yOffset});
    // renderPoint(cCtx, aiCar.nextWP, 15, 'red');
  });
  
  // points.forEach((p, i) => {
  //   renderPoint(cCtx, i, 8, 'blue');
  // });
  // car.debug(cCtx);

  if(mAudio) {
    if(!car.isRunning && !mAudio.isStopped)
      mAudio.stop();
    else if(car.isRunning && mAudio.isStopped)
      mAudio.restart();
    mAudio.rate_level = 0.8 + car.velocity;
    mAudio.rate();
  }
  
  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);


//https://blog.bullgare.com/2019/03/simple-way-to-detect-browsers-fps-via-js/
let fps;
let fpsEl = document.querySelector('.fps');
let times = [];
function fpsLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    fpsEl.innerText = fps;
    fpsLoop();
  });
}
fpsLoop();