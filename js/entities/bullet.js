"use strict";

var CONFIG = require('../config');
var Entity = require('./base');

function Bullet(x, y, direction, owner, ownerTank) {
  var size = Math.floor(CONFIG.TILE_SIZE / 4);
  Entity.call(this, x, y, size, size);
  this.direction = direction;
  this.owner = owner;
  this.ownerTank = ownerTank;
  var vec = CONFIG.DIRECTION_VECTORS[direction];
  this.vx = vec[0] * CONFIG.BULLET_SPEED;
  this.vy = vec[1] * CONFIG.BULLET_SPEED;
}

Bullet.prototype = Object.create(Entity.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function (dt) {
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  if (
    this.x + this.w < 0 ||
    this.x > CONFIG.MAP_WIDTH ||
    this.y + this.h < 0 ||
    this.y > CONFIG.MAP_HEIGHT
  ) {
    this.kill();
  }
};

Bullet.prototype.draw = function (ctx) {
  ctx.save();
  ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
  ctx.rotate(this.direction * Math.PI / 2);
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
  ctx.restore();
};

Bullet.prototype.shouldHit = function (otherOwner) {
  return this.owner !== otherOwner;
};

module.exports = Bullet;
