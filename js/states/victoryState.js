"use strict";

var State = require('./state');
var CONFIG = require('../config');
var helpers = require('../utils/helpers');

function VictoryState(game) {
  State.call(this, game);
}

VictoryState.prototype = Object.create(State.prototype);
VictoryState.prototype.constructor = VictoryState;

VictoryState.prototype.enter = function (params) {
  params = params || {};
  this.score = params.score || 0;
  this.levelIndex = params.levelIndex || 1;
  this.hasNext = params.hasNext !== false;
};

VictoryState.prototype.handleInput = function () {
  if (this.game.input.consumeTap()) {
    if (this.hasNext) {
      this.game.changeState('play', {
        levelIndex: this.levelIndex + 1,
        score: this.score
      });
    } else {
      this.game.changeState('menu');
    }
  }
};

VictoryState.prototype.update = function (dt) {};

VictoryState.prototype.draw = function (ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
  helpers.drawText(ctx, 'VICTORY', 48, CONFIG.COLORS.GREEN,
    CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 3);
  helpers.drawText(ctx, '关卡完成', 32, CONFIG.COLORS.WHITE,
    CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2);
  helpers.drawText(ctx, '得分: ' + this.score, 22, CONFIG.COLORS.YELLOW,
    CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 45);
  var hint = this.hasNext ? '点击屏幕进入下一关' : '恭喜通关！点击返回菜单';
  helpers.drawText(ctx, hint, 20, CONFIG.COLORS.LIGHT_GREY,
    CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT * 2 / 3 + 40);
};

module.exports = VictoryState;
