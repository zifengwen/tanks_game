"use strict";

var CONFIG = require('../config');
var Tank = require('./tank');

function PlayerTank(x, y, assets) {
  var asset = function (ctx, dx, dy, size) {
    assets.drawPlayerTank(ctx, dx, dy, size);
  };
  Tank.call(this, x, y, asset, CONFIG.PLAYER_SPEED, CONFIG.PLAYER_SHOOT_COOLDOWN);
  this.lives = CONFIG.PLAYER_LIVES;
  this.invincibleTimer = 0;
  this.respawnTimer = 0;
  this.spawnPos = { x: x, y: y };
  this.blinkTimer = 0;
  this.visible = true;
}

PlayerTank.prototype = Object.create(Tank.prototype);
PlayerTank.prototype.constructor = PlayerTank;

PlayerTank.prototype.handleInput = function (input) {
  if (this.respawnTimer > 0) {
    return;
  }
  if (input.dpadDirection !== null) {
    this.setDirection(input.dpadDirection);
    this.moving = true;
  } else {
    this.moving = false;
  }
};

PlayerTank.prototype.update = function (dt, level, enemies) {
  Tank.prototype.update.call(this, dt);
  if (this.respawnTimer > 0) {
    this.respawnTimer -= dt;
    if (this.respawnTimer <= 0) {
      this.respawn(this.spawnPos.x, this.spawnPos.y);
    }
    return;
  }
  if (this.invincibleTimer > 0) {
    this.invincibleTimer -= dt;
    this.blinkTimer += dt;
    if (this.blinkTimer >= 0.1) {
      this.blinkTimer = 0;
      this.visible = !this.visible;
    }
  } else {
    this.visible = true;
  }
  if (this.moving) {
    this.tryMove(dt, level, []);
  }
};

PlayerTank.prototype.draw = function (ctx) {
  if (!this.visible) {
    return;
  }
  Tank.prototype.draw.call(this, ctx);
};

PlayerTank.prototype.shoot = function () {
  if (this.respawnTimer > 0) {
    return null;
  }
  return Tank.prototype.shoot.call(this, "player");
};

PlayerTank.prototype.takeDamage = function () {
  if (this.respawnTimer > 0 || this.invincibleTimer > 0) {
    return;
  }
  this.lives -= 1;
  if (this.lives > 0) {
    this.respawnTimer = CONFIG.PLAYER_RESPAWN_TIME;
    this.invincibleTimer = 0;
    this.visible = false;
  } else {
    this.kill();
  }
};

PlayerTank.prototype.respawn = function (x, y) {
  Tank.prototype.respawn.call(this, x, y);
  this.invincibleTimer = CONFIG.PLAYER_INVINCIBLE_TIME;
  this.visible = true;
  this.blinkTimer = 0;
};

PlayerTank.prototype.isDead = function () {
  return this.lives <= 0 && this.respawnTimer <= 0;
};

module.exports = PlayerTank;
