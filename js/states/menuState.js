"use strict";

var State = require('./state');
var CONFIG = require('../config');
var helpers = require('../utils/helpers');

function MenuState(game) {
  State.call(this, game);
  this.avatar = null;
  this.avatarLoaded = false;
  this._loadAvatar();
}

MenuState.prototype = Object.create(State.prototype);
MenuState.prototype.constructor = MenuState;

MenuState.prototype._loadAvatar = function () {
  var image = wx.createImage();
  var self = this;
  image.onload = function () {
    self.avatar = image;
    self.avatarLoaded = true;
  };
  image.src = 'tank_avatar.png';
};

MenuState.prototype.handleInput = function () {
  if (this.game.input.consumeTap()) {
    this.game.changeState('play', { levelIndex: 1 });
  }
};

MenuState.prototype.update = function (dt) {};

MenuState.prototype.draw = function (ctx) {
  ctx.fillStyle = CONFIG.COLORS.BLACK;
  ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
  helpers.drawText(ctx, '像素装甲闯关', 48, CONFIG.COLORS.YELLOW,
    CONFIG.SCREEN_WIDTH / 2, 100);

  if (this.avatarLoaded) {
    var size = 120;
    ctx.drawImage(this.avatar,
      CONFIG.SCREEN_WIDTH / 2 - size / 2,
      220 - size / 2,
      size, size);
  }

  helpers.drawText(ctx, '点击屏幕开始游戏', 20, CONFIG.COLORS.WHITE,
    CONFIG.SCREEN_WIDTH / 2, 360);
  helpers.drawText(ctx, 'D-Pad 移动  按钮 射击', 18, CONFIG.COLORS.LIGHT_GREY,
    CONFIG.SCREEN_WIDTH / 2, 395);
};

module.exports = MenuState;
