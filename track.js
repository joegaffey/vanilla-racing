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
  }
  
  getStartPosition(index, points) {
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
      ctx.fillRect(p.x + 5, p.y, 20, 30);
      ctx.fillStyle = 'gray';
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
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (var i = 0; i < this.points.length - 1; i++) {
      ctx.arcTo(
        this.points[i].x,
        this.points[i].y,
        this.points[i + 1].x,
        this.points[i + 1].y,
        90
      );
    }
    ctx.arcTo(
      this.points[this.points.length - 1].x,
      this.points[this.points.length - 1].y,
      this.points[0].x,
      this.points[0].y,
      90
    );
    ctx.arcTo(
      this.points[0].x,
      this.points[0].y,
      this.points[1].x,
      this.points[1].y,
      90
    );
    ctx.stroke();
  }
}
