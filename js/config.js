"use strict";

function c(r, g, b, a) {
  if (a === undefined || a === 1) {
    return "rgb(" + r + "," + g + "," + b + ")";
  }
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

const TILE_SIZE = 32;
const GRID_COLS = 13;
const GRID_ROWS = 13;
const MAP_WIDTH = TILE_SIZE * GRID_COLS;
const MAP_HEIGHT = TILE_SIZE * GRID_ROWS;
const HUD_HEIGHT = 64;
const SCREEN_WIDTH = MAP_WIDTH;
const SCREEN_HEIGHT = MAP_HEIGHT + HUD_HEIGHT;
const FPS = 60;

const DIR_UP = 0;
const DIR_RIGHT = 1;
const DIR_DOWN = 2;
const DIR_LEFT = 3;

module.exports = {
  TILE_SIZE: TILE_SIZE,
  GRID_COLS: GRID_COLS,
  GRID_ROWS: GRID_ROWS,
  MAP_WIDTH: MAP_WIDTH,
  MAP_HEIGHT: MAP_HEIGHT,
  HUD_HEIGHT: HUD_HEIGHT,
  SCREEN_WIDTH: SCREEN_WIDTH,
  SCREEN_HEIGHT: SCREEN_HEIGHT,
  FPS: FPS,

  COLOR_BLACK: c(0, 0, 0),
  COLOR_WHITE: c(255, 255, 255),
  COLOR_GREY: c(128, 128, 128),
  COLOR_DARK_GREY: c(64, 64, 64),
  COLOR_LIGHT_GREY: c(192, 192, 192),
  COLOR_RED: c(255, 0, 0),
  COLOR_GREEN: c(0, 255, 0),
  COLOR_BLUE: c(0, 0, 255),
  COLOR_YELLOW: c(255, 255, 0),
  COLOR_ORANGE: c(255, 165, 0),
  COLOR_BROWN: c(139, 69, 19),
  COLOR_STEEL: c(169, 169, 169),
  COLOR_WATER: c(65, 105, 225),
  COLOR_GRASS: c(34, 139, 34),

  COLORS: {
    BLACK: c(0, 0, 0),
    WHITE: c(255, 255, 255),
    GREY: c(128, 128, 128),
    DARK_GREY: c(64, 64, 64),
    LIGHT_GREY: c(192, 192, 192),
    RED: c(255, 0, 0),
    GREEN: c(0, 255, 0),
    BLUE: c(0, 0, 255),
    YELLOW: c(255, 255, 0),
    ORANGE: c(255, 165, 0),
    BROWN: c(139, 69, 19),
    STEEL: c(169, 169, 169),
    WATER: c(65, 105, 225),
    GRASS: c(34, 139, 34)
  },

  DIR_UP: DIR_UP,
  DIR_RIGHT: DIR_RIGHT,
  DIR_DOWN: DIR_DOWN,
  DIR_LEFT: DIR_LEFT,

  DIRECTION_VECTORS: [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ],

  PLAYER_SPEED: 120,
  ENEMY_SPEED: 80,
  BULLET_SPEED: 320,
  PLAYER_SHOOT_COOLDOWN: 0.4,
  ENEMY_SHOOT_COOLDOWN: 2.0,
  ENEMY_CHANGE_DIR_TIME: 1.5,
  PLAYER_LIVES: 3,
  ENEMY_COUNT_PER_LEVEL: 20,
  MAX_ENEMIES_ON_SCREEN: 4,
  ENEMY_SPAWN_INTERVAL: 3.0,
  PLAYER_RESPAWN_TIME: 1.5,
  PLAYER_INVINCIBLE_TIME: 2.0,

  SYM_EMPTY: ".",
  SYM_BRICK: "#",
  SYM_STEEL: "@",
  SYM_WATER: "~",
  SYM_GRASS: "*",
  SYM_EAGLE: "E",
  SYM_PLAYER_SPAWN: "P",
  SYM_ENEMY_SPAWN: "1",
  ENEMY_SPAWN_SYMBOLS: new Set(["1", "2", "3"])
};
