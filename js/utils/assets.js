"use strict";

var CONFIG = require('../config');

function drawPixelImage(ctx, pixelMap, colorMap, x, y, size) {
  var rows = pixelMap.length;
  var cols = pixelMap[0] ? pixelMap[0].length : 0;
  if (rows === 0 || cols === 0) {
    return;
  }
  var pixelW = size / cols;
  var pixelH = size / rows;
  for (var r = 0; r < rows; r++) {
    var row = pixelMap[r];
    for (var c = 0; c < cols; c++) {
      var color = colorMap[row[c]];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + c * pixelW, y + r * pixelH, pixelW, pixelH);
      }
    }
  }
}

function Assets() {
  var tc = {
    '.': null,
    'B': CONFIG.COLORS.BLACK,
    'Y': CONFIG.COLORS.YELLOW,
    'G': CONFIG.COLORS.GREEN,
    'R': CONFIG.COLORS.RED,
    'W': CONFIG.COLORS.WHITE,
    'S': CONFIG.COLORS.STEEL
  };

  var ts = CONFIG.TILE_SIZE;

  this.playerTankMap = [
    "BBBBBBBB",
    "BWWBBWWB",
    "BWWBBWWB",
    "BBBBYBBB",
    "BYYYYYYB",
    "BYYYYYYB",
    "BBBBYBBB",
    "BWWBBWWB",
    "BWWBBWWB",
    "BBBBBBBB"
  ];
  this.enemyTankMap = [
    "BBBBBBBB",
    "BWWBBWWB",
    "BWWBBWWB",
    "BBBBRBBB",
    "BRRRRRRB",
    "BRRRRRRB",
    "BBBBRBBB",
    "BWWBBWWB",
    "BWWBBWWB",
    "BBBBBBBB"
  ];
  this.bulletMap = [["W"]];
  this.brickMap = [
    "BBBBBBBB",
    "BRRBRRRB",
    "BRRBRRRB",
    "BBBBBBBB",
    "BRRBRRRB",
    "BRRBRRRB",
    "BBBBBBBB",
    "BRRBRRRB"
  ];
  this.steelMap = [
    "SSSSSSSS",
    "SWWSSWWS",
    "SWWSSWWS",
    "SSSSSSSS",
    "SWWSSWWS",
    "SWWSSWWS",
    "SSSSSSSS",
    "SWWSSWWS"
  ];
  this.waterMap = [["B"]];
  this.grassMap = [["G"]];
  this.eagleMap = [
    "....BB....",
    "...BWWB...",
    "..BWYYWB..",
    ".BWYYYYWB.",
    "BWYYYYYYWB",
    "BWYYYYYYWB",
    ".BWYYYYWB.",
    "..BWYYWB..",
    "...BWWB...",
    "....BB...."
  ];
  this.explosionMap = [
    "...YY...",
    ".YYRRYY.",
    "YRRWRRYY",
    "YRWWRWRY",
    "YRRWRRRY",
    ".YYRRYY.",
    "..YYYY.."
  ];

  this.tc = tc;
  this.ec = {
    '.': null,
    'B': CONFIG.COLORS.BLACK,
    'W': CONFIG.COLORS.WHITE,
    'Y': CONFIG.COLORS.YELLOW
  };
  this.wc = { 'B': CONFIG.COLORS.WATER };
  this.gc = { 'G': CONFIG.COLORS.GRASS };
  this.bc = { 'W': CONFIG.COLORS.WHITE };
}

Assets.prototype.drawPlayerTank = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.playerTankMap, this.tc, x, y, size);
};

Assets.prototype.drawEnemyTank = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.enemyTankMap, this.tc, x, y, size);
};

Assets.prototype.drawBullet = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.bulletMap, this.bc, x, y, size);
};

Assets.prototype.drawBrick = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.brickMap, this.tc, x, y, size);
};

Assets.prototype.drawSteel = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.steelMap, this.tc, x, y, size);
};

Assets.prototype.drawWater = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.waterMap, this.wc, x, y, size);
};

Assets.prototype.drawGrass = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.grassMap, this.gc, x, y, size);
};

Assets.prototype.drawEagle = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.eagleMap, this.ec, x, y, size);
};

Assets.prototype.drawExplosion = function (ctx, x, y, size) {
  drawPixelImage(ctx, this.explosionMap, this.tc, x, y, size);
};

module.exports = Assets;
