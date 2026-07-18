"use strict";

var CONFIG = require('../config');
var Tank = require('./tank');

function EnemyTank(x, y, assets) {
  var asset = function (ctx, dx, dy, size) {
    assets.drawEnemyTank(ctx, dx, dy, size);
  };
  Tank.call(this, x, y, asset, CONFIG.ENEMY_SPEED, CONFIG.ENEMY_SHOOT_COOLDOWN);
  this.changeDirTimer = 0.5 + Math.random() * (CONFIG.ENEMY_CHANGE_DIR_TIME - 0.5);
  this.shootTimer = 0.5 + Math.random() * (CONFIG.ENEMY_SHOOT_COOLDOWN - 0.5);
}

EnemyTank.prototype = Object.create(Tank.prototype);
EnemyTank.prototype.constructor = EnemyTank;

EnemyTank.prototype.pickDirection = function (level, player) {
  var directions = [
    CONFIG.DIR_UP,
    CONFIG.DIR_RIGHT,
    CONFIG.DIR_DOWN,
    CONFIG.DIR_LEFT
  ];

  directions.sort(function () {
    return Math.random() - 0.5;
  });

  if (player && player.alive) {
    var px = player.x + player.w / 2;
    var py = player.y + player.h / 2;
    var cx = this.x + this.w / 2;
    var cy = this.y + this.h / 2;
    var preferred;
    if (Math.abs(px - cx) > Math.abs(py - cy)) {
      preferred = px > cx ? CONFIG.DIR_RIGHT : CONFIG.DIR_LEFT;
    } else {
      preferred = py > cy ? CONFIG.DIR_DOWN : CONFIG.DIR_UP;
    }
    var filtered = directions.filter(function (d) {
      return d !== preferred;
    });
    filtered.unshift(preferred);
    directions = filtered;
  }

  for (var i = 0; i < directions.length; i++) {
    var dir = directions[i];
    this.setDirection(dir);
    var vec = CONFIG.DIRECTION_VECTORS[dir];
    if (this.canMove(vec[0] * 8, vec[1] * 8, level)) {
      return dir;
    }
  }
  return this.direction;
};

EnemyTank.prototype.update = function (dt, level, player, allEnemies) {
  Tank.prototype.update.call(this, dt);
  this.changeDirTimer -= dt;
  this.shootTimer -= dt;

  if (this.changeDirTimer <= 0) {
    this.pickDirection(level, player);
    this.changeDirTimer = 0.8 + Math.random() * (CONFIG.ENEMY_CHANGE_DIR_TIME - 0.8);
  }

  if (!this.tryMove(dt, level, allEnemies)) {
    this.pickDirection(level, player);
    this.changeDirTimer = 0.5 + Math.random() * (CONFIG.ENEMY_CHANGE_DIR_TIME - 0.5);
  }

  if (this.shootTimer <= 0) {
    this.shootTimer = 1.0 + Math.random() * (CONFIG.ENEMY_SHOOT_COOLDOWN - 1.0);
    return Tank.prototype.shoot.call(this, "enemy");
  }
  return null;
};

EnemyTank.prototype.takeDamage = function () {
  this.kill();
};

module.exports = EnemyTank;
