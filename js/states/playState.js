"use strict";

var CONFIG = require('../config');
var State = require('./state');
var PlayerTank = require('../entities/player');
var EnemyTank = require('../entities/enemy');
var Level = require('../world/level');
var tileModule = require('../world/tile');
var levelsData = require('../world/levelsData');
var helpers = require('../utils/helpers');

function drawArrow(ctx, x, y, direction, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(direction * Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(-size / 2, 0);
  ctx.lineTo(size / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function PlayState(game) {
  State.call(this, game);
  this.assets = game.assets;
  this.level = null;
  this.levelIndex = 1;
  this.player = null;
  this.enemies = [];
  this.bullets = [];
  this.explosions = [];
  this.score = 0;
  this.enemyRemaining = 0;
  this.enemySpawnTimer = 0;
}

PlayState.prototype = Object.create(State.prototype);
PlayState.prototype.constructor = PlayState;

PlayState.prototype.enter = function (params) {
  params = params || {};
  this.levelIndex = params.levelIndex || 1;
  this.score = params.score || 0;
  this.loadLevel(this.levelIndex);
};

PlayState.prototype.loadLevel = function (index) {
  var rows = levelsData[index];
  if (!rows) {
    this.game.changeState('victory', {
      score: this.score,
      levelIndex: index - 1,
      hasNext: false
    });
    return;
  }
  this.level = new Level(rows, this.assets);
  var spawn = this.level.playerSpawn;
  this.player = new PlayerTank(spawn.x, spawn.y, this.assets);
  this.enemies = [];
  this.bullets = [];
  this.explosions = [];
  this.enemyRemaining = this.level.enemyCount;
  this.enemySpawnTimer = 0;
};

PlayState.prototype.handleInput = function () {
  if (this.game.input.consumeTap()) {
    // 全局点击备用，当前无特殊用途
  }
};

PlayState.prototype.update = function (dt) {
  if (!this.level || !this.player) {
    return;
  }

  this.player.handleInput(this.game.input);
  if (this.game.input.firePressed) {
    var b = this.player.shoot();
    if (b) {
      this.bullets.push(b);
    }
  }
  this.player.update(dt, this.level, this.enemies);

  this.spawnEnemies(dt);

  var allEnemies = this.enemies;
  for (var i = 0; i < allEnemies.length; i++) {
    var bullet = allEnemies[i].update(dt, this.level, this.player, allEnemies);
    if (bullet) {
      this.bullets.push(bullet);
    }
  }

  for (i = 0; i < this.bullets.length; i++) {
    this.bullets[i].update(dt);
  }

  this.explosions = this.explosions.filter(function (e) {
    e.lifetime -= dt;
    return e.lifetime > 0;
  });

  this.handleCollisions();

  this.enemies = this.enemies.filter(function (e) {
    return e.alive;
  });
  this.bullets = this.bullets.filter(function (b) {
    return b.alive;
  });

  this.checkEndConditions();
};

PlayState.prototype.spawnEnemies = function (dt) {
  if (this.enemyRemaining <= 0) {
    return;
  }
  if (this.enemies.length >= CONFIG.MAX_ENEMIES_ON_SCREEN) {
    return;
  }
  this.enemySpawnTimer -= dt;
  if (this.enemySpawnTimer <= 0) {
    this.enemySpawnTimer = CONFIG.ENEMY_SPAWN_INTERVAL;
    var sp = this.level.enemySpawns[Math.floor(Math.random() * this.level.enemySpawns.length)];
    this.enemies.push(new EnemyTank(sp.x, sp.y, this.assets));
    this.enemyRemaining -= 1;
  }
};

PlayState.prototype.handleCollisions = function () {
  var i, j;

  // 子弹 vs 瓦片
  for (i = 0; i < this.bullets.length; i++) {
    var bullet = this.bullets[i];
    for (j = 0; j < this.level.bulletBlockTiles.length; j++) {
      var tile = this.level.bulletBlockTiles[j];
      if (!tile.alive) {
        continue;
      }
      if (helpers.rectsIntersect(bullet.getRect(), tile.getRect())) {
        if (tile instanceof tileModule.Eagle) {
          tile.takeDamage();
          bullet.kill();
          this.addExplosion(tile.x + tile.w / 2, tile.y + tile.h / 2);
        } else if (tile.destructible) {
          tile.takeDamage();
          bullet.kill();
          this.addExplosion(tile.x + tile.w / 2, tile.y + tile.h / 2);
        } else {
          bullet.kill();
        }
        break;
      }
    }
  }

  // 子弹 vs 坦克
  for (i = 0; i < this.bullets.length; i++) {
    bullet = this.bullets[i];
    if (bullet.owner === 'player') {
      for (j = 0; j < this.enemies.length; j++) {
        var enemy = this.enemies[j];
        if (enemy.alive && helpers.rectsIntersect(bullet.getRect(), enemy.getRect())) {
          enemy.takeDamage();
          bullet.kill();
          this.score += 100;
          this.addExplosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
          break;
        }
      }
    } else if (bullet.owner === 'enemy') {
      if (this.player.alive && helpers.rectsIntersect(bullet.getRect(), this.player.getRect())) {
        if (this.player.respawnTimer <= 0 && this.player.invincibleTimer <= 0) {
          this.player.takeDamage();
          bullet.kill();
          this.addExplosion(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
        }
      }
    }
  }

  // 子弹 vs 子弹
  for (i = 0; i < this.bullets.length; i++) {
    var a = this.bullets[i];
    for (j = i + 1; j < this.bullets.length; j++) {
      var b = this.bullets[j];
      if (a.alive && b.alive && helpers.rectsIntersect(a.getRect(), b.getRect()) && a.owner !== b.owner) {
        a.kill();
        b.kill();
      }
    }
  }

  // 玩家 vs 敌人
  if (this.player.alive && this.player.respawnTimer <= 0 && this.player.invincibleTimer <= 0) {
    for (i = 0; i < this.enemies.length; i++) {
      enemy = this.enemies[i];
      if (enemy.alive && helpers.rectsIntersect(this.player.getRect(), enemy.getRect())) {
        this.player.takeDamage();
        this.addExplosion(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
        break;
      }
    }
  }
};

PlayState.prototype.addExplosion = function (cx, cy) {
  this.explosions.push({
    x: cx,
    y: cy,
    lifetime: 0.3
  });
};

PlayState.prototype.checkEndConditions = function () {
  if (!this.level.isEagleAlive() || this.player.isDead()) {
    this.game.changeState('gameOver', {
      score: this.score,
      levelIndex: this.levelIndex
    });
    return;
  }
  if (this.enemyRemaining <= 0 && this.enemies.length === 0) {
    this.game.changeState('victory', {
      score: this.score,
      levelIndex: this.levelIndex,
      hasNext: true
    });
  }
};

PlayState.prototype.draw = function (ctx) {
  ctx.fillStyle = CONFIG.COLORS.BLACK;
  ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

  if (this.level) {
    this.level.draw(ctx);
  }
  if (this.player) {
    this.player.draw(ctx);
  }
  for (var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].draw(ctx);
  }
  for (i = 0; i < this.bullets.length; i++) {
    this.bullets[i].draw(ctx);
  }
  for (i = 0; i < this.explosions.length; i++) {
    var exp = this.explosions[i];
    this.assets.drawExplosion(ctx, exp.x - CONFIG.TILE_SIZE / 2, exp.y - CONFIG.TILE_SIZE / 2, CONFIG.TILE_SIZE);
  }
  if (this.level) {
    this.level.drawGrass(ctx);
  }

  this.drawHud(ctx);
  this.drawTouchControls(ctx);
};

PlayState.prototype.drawHud = function (ctx) {
  var hudY = CONFIG.MAP_HEIGHT;
  ctx.fillStyle = CONFIG.COLORS.DARK_GREY;
  ctx.fillRect(0, hudY, CONFIG.SCREEN_WIDTH, CONFIG.HUD_HEIGHT);
  var mid = hudY + CONFIG.HUD_HEIGHT / 2;
  helpers.drawText(ctx, '关卡 ' + this.levelIndex, 18, CONFIG.COLORS.WHITE, 10, mid, false);
  helpers.drawText(ctx, '得分 ' + this.score, 18, CONFIG.COLORS.YELLOW, 110, mid, false);
  helpers.drawText(ctx, '生命 ' + (this.player ? this.player.lives : 0), 18, CONFIG.COLORS.GREEN, 230, mid, false);
  helpers.drawText(ctx, '剩余 ' + (this.enemyRemaining + this.enemies.length), 18, CONFIG.COLORS.RED, 320, mid, false);
};

PlayState.prototype.drawTouchControls = function (ctx) {
  var input = this.game.input;

  // D-pad 底盘
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.beginPath();
  ctx.arc(input.dpadCenter.x, input.dpadCenter.y, input.dpadRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = CONFIG.COLORS.GREY;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 方向箭头
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = CONFIG.COLORS.DARK_GREY;
  var arrowOffset = input.dpadRadius - 18;
  var arrowSize = 14;
  drawArrow(ctx, input.dpadCenter.x, input.dpadCenter.y - arrowOffset, CONFIG.DIR_UP, arrowSize);
  drawArrow(ctx, input.dpadCenter.x, input.dpadCenter.y + arrowOffset, CONFIG.DIR_DOWN, arrowSize);
  drawArrow(ctx, input.dpadCenter.x - arrowOffset, input.dpadCenter.y, CONFIG.DIR_LEFT, arrowSize);
  drawArrow(ctx, input.dpadCenter.x + arrowOffset, input.dpadCenter.y, CONFIG.DIR_RIGHT, arrowSize);

  // 中心点
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = CONFIG.COLORS.GREY;
  ctx.beginPath();
  ctx.arc(input.dpadCenter.x, input.dpadCenter.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Fire 按钮
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = input.firePressed ? CONFIG.COLORS.RED : CONFIG.COLORS.ORANGE;
  ctx.beginPath();
  ctx.arc(input.fireCenter.x, input.fireCenter.y, input.fireRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = CONFIG.COLORS.WHITE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  helpers.drawText(ctx, 'FIRE', 16, CONFIG.COLORS.WHITE, input.fireCenter.x, input.fireCenter.y);
};

module.exports = PlayState;
