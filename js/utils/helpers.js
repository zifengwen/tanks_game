"use strict";

var CONFIG = require('../config');

function gridToPixel(gx, gy) {
  return {
    x: gx * CONFIG.TILE_SIZE,
    y: gy * CONFIG.TILE_SIZE
  };
}

function pixelToGrid(px, py) {
  return {
    gx: Math.floor(px / CONFIG.TILE_SIZE),
    gy: Math.floor(py / CONFIG.TILE_SIZE)
  };
}

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function drawText(ctx, text, size, color, x, y, center) {
  if (center === undefined) {
    center = true;
  }
  ctx.fillStyle = color;
  ctx.font = 'bold ' + size + 'px "Microsoft YaHei", "SimHei", sans-serif';
  ctx.textBaseline = 'middle';
  if (center) {
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  } else {
    ctx.textAlign = 'left';
    ctx.fillText(text, x, y);
  }
}

module.exports = {
  gridToPixel: gridToPixel,
  pixelToGrid: pixelToGrid,
  rectsIntersect: rectsIntersect,
  drawText: drawText
};
