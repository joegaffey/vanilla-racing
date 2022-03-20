//@TODO Add camera https://jsfiddle.net/931wk75n/2/
//@TODO Add particles https://modernweb.com/creating-particles-html5-canvas/

// var audio = document.getElementById('bgMusic');
// audio.volume = 0.05;
// audio.play();


import MotorAudio from './motor-audio.js';
import Car from './car.js';
import Track from './track.js';
import tracks from './tracks.js';
import AI from './ai.js';
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const scale = 4;
const cCanvas = document.querySelector('.cars');
const cCtx = cCanvas.getContext('2d');

const tCanvas = document.querySelector('.tyre-marks');
const tCtx = tCanvas.getContext('2d');

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

let trackNum = null;
if(window.location.hash) {
  if(window.location.hash.includes('track'))
    trackNum  = getHashParam('track');
}

function getHashParam(name) {
  var query = window.location.hash.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == name) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

const trackData = tracks[trackNum || Math.floor(Math.random() * tracks.length)];
// const trackData = tracks[0];

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
let track;

function setup() {
  cCanvas.width = window.innerWidth;
  cCanvas.height = window.innerHeight;
  tCanvas.width = window.innerWidth;
  tCanvas.height = window.innerHeight;
  
  const bounds = getBounds(trackData.points);
  track = new Track(trackData);
  track.points = centerPoints(trackData.points, bounds);
  
  tCtx.globalAlpha = 1;
  track.render(tCtx);
  
  tCtx.fillStyle = 'black';  
  tCtx.globalAlpha = 0.01;  
  tCtx.scale(scale, scale);
  cCtx.scale(scale, scale);  
}
setup();

const p = track.getStartPosition(0, trackData.points);
const car = new Car(p.x - 15, p.y + 7.5, -Math.PI / 2, 0.8, 15, 30, 4, scale);

const onlineCars = {};
let socket = null;

const online = getHashParam('online');
if(online) {
  const startTime = Date.now();

  socket = io('https://vanilla-racing-online.glitch.me', {
    withCredentials: true
  });
  
  socket.on('update', (msg) => {
    const oCar = onlineCars[msg.id];
    if(!oCar)
      return;
    oCar.x = msg.x;
    oCar.y = msg.y;
    oCar.angle = msg.angle;
  });

  socket.on('newPlayer', (msg) => {
    if(msg.track !== trackNum || onlineCars[msg.id] || msg.id == socket.id)
      return;
    const p = track.getStartPosition(0, trackData.points);
    const oCar = new Car(p.x - 15, p.y + 7.5, -Math.PI / 2, 0.8, 15, 30, 4, scale);
    onlineCars[msg.id] = oCar;
    // positionCarsByStartTime();
    socket.emit('newPlayer', { startTime: startTime, track: trackNum });
  });
  
  socket.on('players', (msg) => {
    // console.log(msg)
  });
  
  socket.on('playerExit', (msg) => {
    delete onlineCars[msg];
  });
  
  socket.emit('newPlayer', { startTime: startTime, track: trackNum });
}

function positionCarsByStartTime() {
  const cars = Object.values(onlineCars);
  cars.push(car);
  cars.sort((a, b) => a.startTime > b.startTime);
  cars.forEach((oCar, i) => {
    const p = track.getStartPosition(i, trackData.points);
    if(onlineCars[oCar.id]) {
      onlineCars[oCar.id].x = p.x - 15;
      onlineCars[oCar.id].y = p.y + 7.5;
      onlineCars[oCar.id].angle = -Math.PI / 2;
    }
    else {
      car.x = p.x - 15;
      car.y = p.y + 7.5;
      car.angle = -Math.PI / 2;
    }
  })
}

const aiCars = getAICars();
const ai = new AI(aiCars, trackData.points);

function getAICars() {
  const cars = [];
  // for(let i = 1; i < track.boxCount; i++) {
  //   const p = track.getStartPosition(i, trackData.points);
  //   const aiCar = new Car(p.x - 20, p.y + 8, -Math.PI / 2, 0.4, 15, 30, 4, scale);
  //   cars.push(aiCar);
  // }
  
  // const i = 1;
  // const p = track.getStartPosition(i, trackData.points);
  // const aiCar = new Car(p.x - 15, p.y + 7.5, -Math.PI / 2, 0.4, 15, 30, 4, scale);
  // aiCar.debugOn = true;
  // cars.push(aiCar);
  
  return cars;
}

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
  ctx.arc(p.x  / scale, p.y / scale, size / scale, 0, 2 * Math.PI);
  ctx.stroke();
}

function renderLine(ctx, a, b, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(a.x / scale, a.y / scale);
  ctx.lineTo(b.x / scale, b.y / scale);
  ctx.stroke();
}

function step() {
  
  if(online) {
    socket.emit('update', { id: socket.id, x: car.x, y: car.y, angle: car.angle });
  }
  
  const debug = aiCars.length > 0;
  
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
    if(debug) {
      if(aiCar.debugOn)
        aiCar.debug(cCtx);
      renderPoint(cCtx, track.points[aiCar.nextWP], 15, 'red');
      renderLine(cCtx, {x: aiCar.x + xOffset + aiCar.length, y: aiCar.y + yOffset + aiCar.width}, track.points[aiCar.nextWP], 'red');
    }
  });
  
  Object.values(onlineCars).forEach(oCar => {
    oCar.renderTyreMarks(tCtx, {x: xOffset, y: yOffset});
    oCar.render(cCtx, {x: xOffset, y: yOffset});
  });
  
  
  if(debug) {
    track.points.forEach(p => {
      renderPoint(cCtx, p, 8, 'blue'); 
    });
  }
  
  //car.debug(cCtx);

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