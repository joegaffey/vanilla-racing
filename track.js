export default class Track {
  
  render(ctx, points) {
    this.drawKerbs(ctx, points);
    ctx.filter = 'none';   
    this.drawSurface(ctx, points);
    this.drawStartFinishLine(ctx, points);
  }
  
  drawStartFinishLine(ctx, points) {
    ctx.lineCap = 'butt';
    const p = points[0];
    ctx.beginPath();
    
    ctx.setLineDash([]);
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#cccccc';
    ctx.moveTo(p.x, p.y - 50);
    ctx.lineTo(p.x, p.y + 50);
    ctx.stroke();
    
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 5;
           
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = 0;
    
    ctx.beginPath();
    ctx.moveTo(p.x - 5, p.y - 50);
    ctx.lineTo(p.x - 5, p.y + 50);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.lineDashOffset = 5;
    ctx.moveTo(p.x, p.y - 50);
    ctx.lineTo(p.x, p.y + 50);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.lineDashOffset = 0;
    ctx.moveTo(p.x + 5, p.y - 50);
    ctx.lineTo(p.x + 5, p.y + 50);
    ctx.stroke();
  }

  drawKerbs(ctx, points) {
    ctx.lineWidth = 110;
    ctx.beginPath();
    ctx.strokeStyle = '#cccccc';
    for (var i = 0; i < points.length - 1; i++) {
      ctx.arcTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 90);
    }
    ctx.stroke();

    ctx.filter = 'drop-shadow(2px 2px 6px #444)';
    ctx.lineWidth = 110;
    ctx.beginPath();
    ctx.strokeStyle = '#666666';
    ctx.setLineDash([10, 10]);

    for (var i = 0; i < points.length - 1; i++) {
      ctx.arcTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 90);
    }
    ctx.arcTo(points[points.length - 1].x, points[points.length - 1].y, 
              points[0].x, points[0].y, 90);
    ctx.arcTo(points[0].x, points[0].y, 
              points[1].x, points[1].y, 90);
    ctx.stroke();
  }
  
  drawSurface(ctx, points) {
    ctx.strokeStyle = 'gray';
    ctx.lineCap = 'round';
    ctx.lineWidth = 100;
    ctx.beginPath();

    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < points.length - 1; i++) {
      ctx.arcTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 90);
    }
    ctx.arcTo(points[points.length - 1].x, 
              points[points.length - 1].y,  
              points[0].x, points[0].y, 90);
    ctx.arcTo(points[0].x, points[0].y, 
              points[1].x, points[1].y, 90);
    ctx.stroke();
  }
}