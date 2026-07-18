"use strict";

var CONFIG = require('../config');
var Entity = require('./base');
var Bullet = require('./bullet');
var helpers = require('../utils/helpers');

function Tank(x, y, asset, speed, shootCooldown) {
  Entity.call(this, x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
  this.asset = asset;
  this.direction = CONFIG.DIR_UP;
  this.speed = speed;
  this.shootCooldown = shootCooldown;
  this.shootTimer = 0;
  this.activeBullet = null;
  this.moving = false;
}

Tank.prototype = Object.create(Entity.prototype);
Tank.prototype.constructor = Tank;

Tank.prototype.setDirection = function (direction) {
  if (this.direction === direction) {
    return;
  }
  this.direction = direction;
};

Tank.prototype.canMove = function (dx, dy, level, otherTanks) {
  var newRect = {
    x: this.x + dx,
    y: this.y + dy,
    w: this.w,
    h: this.h
  };

  if (newRect.x < 0 || newRect.x + newRect.w > CONFIG.MAP_WIDTH) {
    return false;
  }
  if (newRect.y < 0 || newRect.y + newRect.h > CONFIG.MAP_HEIGHT) {
    return false;
  }
  if (level.collidesWithRect(newRect)) {
    return false;
  }

  if (otherTanks) {
    for (var i = 0; i < otherTanks.length; i++) {
      var tank = otherTanks[i];
      if (tank !== this && tank.alive && helpers.rectsIntersect(newRect, tank.getRect())) {
        return false;
      }
    }
  }
  return true;
};

Tank.prototype.tryMove = function (dt, level, otherTanks) {
  var vec = CONFIG.DIRECTION_VECTORS[this.direction];
  var vx = vec[0];
  var vy = vec[1];
  var dx = vx * this.speed * dt;
  var dy = vy * this.speed * dt;

  if (this.canMove(dx, dy, level, otherTanks)) {
    this.x += dx;
    this.y += dy;
    return true;
  }
  if (dx !== 0 && this.canMove(dx, 0, level, otherTanks)) {
    this.x += dx;
    return true;
  }
  if (dy !== 0 && this.canMove(0, dy, level, otherTanks)) {
    this.y += dy;
    return true;
  }
  return false;
};

Tank.prototype.shoot = function (owner) {
  if (this.shootTimer > 0) {
    return null;
  }
  if (this.activeBullet && this.activeBullet.alive) {
    return null;
  }
  this.shootTimer = this.shootCooldown;

  var vec = CONFIG.DIRECTION_VECTORS[this.direction];
  var vx = vec[0];
  var vy = vec[1];
  var cx = this.x + this.w / 2;
  var cy = this.y + this.h / 2;
  var bulletSize = Math.floor(CONFIG.TILE_SIZE / 4);
  var offset = Math.floor(CONFIG.TILE_SIZE / 2 + bulletSize / 2 + 2);
  var bx = cx - bulletSize / 2 + vx * offset;
  var by = cy - bulletSize / 2 + vy * offset;

  var bullet = new Bullet(bx, by, this.direction, owner, this);
  this.activeBullet = bullet;
  return bullet;
};

Tank.prototype.update = function (dt) {
  if (this.shootTimer > 0) {
    this.shootTimer = Math.max(0, this.shootTimer - dt);
  }
  if (this.activeBullet && !this.activeBullet.alive) {
    this.activeBullet = null;
  }
};

Tank.prototype.takeDamage = function () {
  this.kill();
};

Tank.prototype.respawn = function (x, y) {
  this.x = x;
  this.y = y;
  this.direction = CONFIG.DIR_UP;
  this.alive = true;
  this.shootTimer = 0;
  this.activeBullet = null;
};

Tank.prototype.draw = function (ctx) {
  var cx = this.x + this.w / 2;
  var cy = this.y + this.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(this.direction * Math.PI / 2);
  this.asset(ctx, -this.w / 2, -this.h / 2, this.w);
  ctx.restore();
};

module.exports = Tank;
