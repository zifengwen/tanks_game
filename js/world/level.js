"use strict";

var CONFIG = require('../config');
var helpers = require('../utils/helpers');
var tileModule = require('./tile');

function Level(rows, assets) {
  this.rows = rows || [];
  this.assets = assets;
  this.tiles = [];
  this.solidTiles = [];
  this.bulletBlockTiles = [];
  this.grassTiles = [];
  this.eagle = null;
  this.playerSpawn = null;
  this.enemySpawns = [];
  this.enemyCount = CONFIG.ENEMY_COUNT_PER_LEVEL;
  this.build();
}

Level.prototype.build = function () {
  var emptyRow = CONFIG.SYM_EMPTY.repeat(CONFIG.GRID_COLS);
  while (this.rows.length < CONFIG.GRID_ROWS) {
    this.rows.push(emptyRow);
  }
  this.rows = this.rows.map(function (row) {
    return row.padEnd(CONFIG.GRID_COLS, CONFIG.SYM_EMPTY).slice(0, CONFIG.GRID_COLS);
  });

  this.tiles = [];
  this.solidTiles = [];
  this.bulletBlockTiles = [];
  this.grassTiles = [];
  this.enemySpawns = [];

  for (var gy = 0; gy < CONFIG.GRID_ROWS; gy++) {
    var row = this.rows[gy];
    for (var gx = 0; gx < CONFIG.GRID_COLS; gx++) {
      var ch = row[gx];
      var pos = helpers.gridToPixel(gx, gy);
      var tile = null;

      if (ch === CONFIG.SYM_BRICK) {
        tile = new tileModule.Brick(pos.x, pos.y, this.assets);
      } else if (ch === CONFIG.SYM_STEEL) {
        tile = new tileModule.Steel(pos.x, pos.y, this.assets);
      } else if (ch === CONFIG.SYM_WATER) {
        tile = new tileModule.Water(pos.x, pos.y, this.assets);
      } else if (ch === CONFIG.SYM_GRASS) {
        tile = new tileModule.Grass(pos.x, pos.y, this.assets);
      } else if (ch === CONFIG.SYM_EAGLE) {
        tile = new tileModule.Eagle(pos.x, pos.y, this.assets);
        this.eagle = tile;
      } else if (ch === CONFIG.SYM_PLAYER_SPAWN) {
        this.playerSpawn = { x: pos.x, y: pos.y };
      } else if (CONFIG.ENEMY_SPAWN_SYMBOLS.has(ch)) {
        this.enemySpawns.push({ x: pos.x, y: pos.y });
      }

      if (tile) {
        this.tiles.push(tile);
        if (tile.solid) {
          this.solidTiles.push(tile);
        }
        if (tile.blocksBullets) {
          this.bulletBlockTiles.push(tile);
        }
        if (tile instanceof tileModule.Grass) {
          this.grassTiles.push(tile);
        }
      }
    }
  }

  if (!this.playerSpawn) {
    this.playerSpawn = helpers.gridToPixel(Math.floor(CONFIG.GRID_COLS / 2), CONFIG.GRID_ROWS - 2);
  }
  if (this.enemySpawns.length === 0) {
    this.enemySpawns = [
      helpers.gridToPixel(0, 0),
      helpers.gridToPixel(CONFIG.GRID_COLS - 1, 0),
      helpers.gridToPixel(Math.floor(CONFIG.GRID_COLS / 2), 0)
    ];
  }
};

Level.prototype.collidesWithRect = function (rect) {
  for (var i = 0; i < this.solidTiles.length; i++) {
    var tile = this.solidTiles[i];
    if (tile.alive && helpers.rectsIntersect(rect, tile.getRect())) {
      return true;
    }
  }
  return false;
};

Level.prototype.isEagleAlive = function () {
  return this.eagle && this.eagle.alive;
};

Level.prototype.draw = function (ctx) {
  for (var i = 0; i < this.tiles.length; i++) {
    var tile = this.tiles[i];
    if (!(tile instanceof tileModule.Grass)) {
      tile.draw(ctx);
    }
  }
};

Level.prototype.drawGrass = function (ctx) {
  for (var i = 0; i < this.grassTiles.length; i++) {
    this.grassTiles[i].draw(ctx);
  }
};

module.exports = Level;
