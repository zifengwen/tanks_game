"use strict";

var State = require('./state');
var CONFIG = require('../config');
var helpers = require('../utils/helpers');

function GameOverState(game) {
  State.call(this, game);
}

GameOverState.prototype = Object.create(State.prototype);
GameOverState.prototype.constructor = GameOverState;

GameOverState.prototype.enter = function (params) {
  params = params || {};
  this.score = params.score || 0;
  this.levelIndex = params.levelIndex || 1;
};

GameOverState.prototype.handleInput = function () {
  if (this.game.input.consumeTap()) {
    this.game.changeState('menu');
  }
};

GameOverState.prototype.update = function (dt) {};

GameOverState.prototype.draw = function (ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
  helpers.drawText(ctx, 'GAME OVER', 48, CONFIG.COLORS.RED,
    CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 3);
  helpers.drawText(ctx, '游戏结束', 32, CONFIG.COLORS.WHITE,
    CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2);
  helpers.drawText(ctx, '得分: ' + this.score, 22, CONFIG.COLORS.YELLOW,
    CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 45);
  helpers.drawText(ctx, '点击屏幕返回菜单', 20, CONFIG.COLORS.LIGHT_GREY,
    CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT * 2 / 3 + 40);
};

module.exports = GameOverState;
