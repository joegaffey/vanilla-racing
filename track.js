export default class Track {
  constructor(data) {
    this.name = data.name;
    this.width = data.width;
    this.points = data.points;
    this.boxCount = data.boxCount;
    this.lanes = Math.floor(this.width / 45);
    this.whitePaintColor = '#bbbbbb';
    this.yellowPaintColor = '#cccccc';
    this.blackPaintColor = '#333333';
    this.redPaintColor = '#999999';
    this.asphaultColor = 'gray';    
    this.dir = this.points[0].x > this.points[1].x ? -1 : 1;
  }
  
  getStartPosition(index, points) {
    // const xVal = points[0].x - ((Math.floor(index / this.lanes) * 70 - 50) *  this.dir);
    const xVal = points[0].x - Math.floor(index / this.lanes) * 70 - 50;
    const yVal = points[0].y - Math.ceil(index % this.lanes) * 50 + 12;
    return {x: xVal, y: yVal};
  }

  render(ctx) {
    this.drawKerbs(ctx, this.points);
    ctx.filter = "none";
    this.drawSurface(ctx, this.points);
    this.drawStartFinishLine(ctx, this.points);
    this.drawStartBoxes(ctx, this.points);
  }
  
  drawStartBoxes(ctx, points) {
    
    for (var i = 0; i < this.boxCount; i++) {
      const p = this.getStartPosition(i, points);
      ctx.fillStyle = this.whitePaintColor;
      // ctx.fillRect((p.x + 5) * this.dir, p.y, 20, 30);
      ctx.fillRect(p.x + 5, p.y, 20, 30);
      ctx.fillStyle = 'gray';
      // ctx.fillRect((p.x - 10) *  this.dir, p.y + 5, 30, 20);
      ctx.fillRect(p.x - 10, p.y + 5, 30, 20);
    }
  }

  drawStartFinishLine(ctx) {
    const p = this.points[0];
    ctx.lineCap = "butt";
    ctx.beginPath();

    ctx.setLineDash([]);
    ctx.lineWidth = 15;
    ctx.strokeStyle = this.whitePaintColor;
    ctx.moveTo(p.x, p.y - this.width / 2);
    ctx.lineTo(p.x, p.y + this.width / 2);
    ctx.stroke();

    ctx.strokeStyle = this.blackPaintColor;
    ctx.lineWidth = 5;

    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = 0;

    ctx.beginPath();
    ctx.moveTo(p.x - 5, p.y - this.width / 2);
    ctx.lineTo(p.x - 5, p.y + this.width / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineDashOffset = 5;
    ctx.moveTo(p.x, p.y - this.width / 2);
    ctx.lineTo(p.x, p.y + this.width / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineDashOffset = 0;
    ctx.moveTo(p.x + 5, p.y - this.width / 2);
    ctx.lineTo(p.x + 5, p.y + this.width / 2);
    ctx.stroke();
  }

  drawKerbs(ctx) {
    ctx.lineWidth = this.width + 10;
    ctx.beginPath();
    ctx.filter = 'drop-shadow(2px 2px 4px #666)';
    ctx.strokeStyle = this.yellowPaintColor;
    this.drawLoop(ctx);

    ctx.filter = 'none';
    ctx.lineWidth = this.width + 10;
    ctx.beginPath();
    ctx.strokeStyle = this.redPaintColor;
    ctx.setLineDash([10, 10]);
    this.drawLoop(ctx);
  }

  drawSurface(ctx) {
    ctx.filter = 'drop-shadow(-2px -2px 4px #555)';
    ctx.strokeStyle = this.asphaultColor;
    ctx.lineCap = 'round';
    ctx.lineWidth = this.width;
    this.drawLoop(ctx);
    ctx.filter = 'none';
  }

  drawLoop(ctx) {
    const points = [...this.points];
    points.push(points[0], points[1]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < points.length - 1; i++) {
      ctx.arcTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 90);
    }
    ctx.stroke();
  }
  
  // drawLoop(ctx) {
  //   const points = [...this.points];
  //   points.push(this.points[0])
  //   ctx.beginPath();
  //   ctx.moveTo((points[0].x), points[0].y);
  //   for(let i = 0; i < points.length - 1; i ++) {
  //     const x_mid = (points[i].x + points[i + 1].x) / 2;
  //     const y_mid = (points[i].y + points[i + 1].y) / 2;
  //     const cp_x1 = (x_mid + points[i].x) / 2;
  //     const cp_x2 = (x_mid + points[i + 1].x) / 2;
  //     ctx.quadraticCurveTo(cp_x1, points[i].y ,x_mid, y_mid);
  //     ctx.quadraticCurveTo(cp_x2, points[i + 1].y, points[i + 1].x, points[i + 1].y);
  //   }
  //   ctx.stroke();
  // } 
  
//   drawLoop(ctx) {
//     ctx.beginPath();
//     ctx.moveTo(this.points[0].x, this.points[0].y);
    
//     const points = [...this.points];
//     points.push(this.points[0]);
//     points.push(this.points[1]);

//     for (let i = 1; i < points.length - 1; i ++) {
//       const xc = (points[i].x + points[ i + 1].x) / 2;
//       const yc = (points[i].y + points[i + 1].y) / 2;
//       ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
//     }
//     ctx.stroke();
//   }
}
