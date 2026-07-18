"use strict";

function Entity(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;
  this.alive = true;
}

Entity.prototype.getRect = function () {
  return { x: this.x, y: this.y, w: this.w, h: this.h };
};

Entity.prototype.update = function (dt) {};

Entity.prototype.draw = function (ctx) {};

Entity.prototype.kill = function () {
  this.alive = false;
};

module.exports = Entity;
