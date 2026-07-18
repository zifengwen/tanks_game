"use strict";

var CONFIG = require('../config');
var Entity = require('../entities/base');

function Tile(x, y, drawFn, color, options) {
  options = options || {};
  Entity.call(this, x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
  this.drawFn = drawFn;
  this.color = color;
  this.solid = options.solid !== undefined ? options.solid : true;
  this.destructible = options.destructible || false;
  this.blocksBullets = options.blocksBullets !== undefined ? options.blocksBullets : true;
  this.gx = Math.floor(x / CONFIG.TILE_SIZE);
  this.gy = Math.floor(y / CONFIG.TILE_SIZE);
}

Tile.prototype = Object.create(Entity.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.takeDamage = function () {
  if (this.destructible) {
    this.kill();
  }
};

Tile.prototype.draw = function (ctx) {
  if (!this.alive) {
    return;
  }
  if (this.drawFn) {
    this.drawFn(ctx, this.x, this.y, this.w);
  } else {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
};

function Brick(x, y, assets) {
  var drawFn = function (ctx, dx, dy, size) {
    assets.drawBrick(ctx, dx, dy, size);
  };
  Tile.call(this, x, y, drawFn, CONFIG.COLORS.BROWN, { destructible: true });
}
Brick.prototype = Object.create(Tile.prototype);
Brick.prototype.constructor = Brick;

function Steel(x, y, assets) {
  var drawFn = function (ctx, dx, dy, size) {
    assets.drawSteel(ctx, dx, dy, size);
  };
  Tile.call(this, x, y, drawFn, CONFIG.COLORS.STEEL);
}
Steel.prototype = Object.create(Tile.prototype);
Steel.prototype.constructor = Steel;

function Water(x, y, assets) {
  var drawFn = function (ctx, dx, dy, size) {
    assets.drawWater(ctx, dx, dy, size);
  };
  Tile.call(this, x, y, drawFn, CONFIG.COLORS.WATER, { blocksBullets: false });
}
Water.prototype = Object.create(Tile.prototype);
Water.prototype.constructor = Water;

function Grass(x, y, assets) {
  var drawFn = function (ctx, dx, dy, size) {
    assets.drawGrass(ctx, dx, dy, size);
  };
  Tile.call(this, x, y, drawFn, CONFIG.COLORS.GRASS, {
    solid: false,
    blocksBullets: false
  });
}
Grass.prototype = Object.create(Tile.prototype);
Grass.prototype.constructor = Grass;

function Eagle(x, y, assets) {
  var drawFn = function (ctx, dx, dy, size) {
    assets.drawEagle(ctx, dx, dy, size);
  };
  Tile.call(this, x, y, drawFn, CONFIG.COLORS.YELLOW, { destructible: true });
}
Eagle.prototype = Object.create(Tile.prototype);
Eagle.prototype.constructor = Eagle;

module.exports = {
  Tile: Tile,
  Brick: Brick,
  Steel: Steel,
  Water: Water,
  Grass: Grass,
  Eagle: Eagle
};
