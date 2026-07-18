"use strict";

var CONFIG = require('../config');
var MenuState = require('../states/menuState');
var PlayState = require('../states/playState');
var GameOverState = require('../states/gameOverState');
var VictoryState = require('../states/victoryState');
var InputManager = require('./input');
var Assets = require('../utils/assets');

function Game() {
  this.canvas = wx.createCanvas();
  this.ctx = this.canvas.getContext('2d');
  this.input = new InputManager(this);
  this.assets = new Assets();

  this.running = true;
  this.lastTime = 0;

  this.states = {
    menu: new MenuState(this),
    play: new PlayState(this),
    gameOver: new GameOverState(this),
    victory: new VictoryState(this)
  };
  this.currentState = this.states.menu;
  this.currentState.enter();

  this.setupScreen();
  this.bindLifecycle();
}

Game.prototype.setupScreen = function () {
  var info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  this.pixelRatio = info.pixelRatio || 1;
  this.screenWidth = info.windowWidth;
  this.screenHeight = info.windowHeight;

  this.gameWidth = CONFIG.SCREEN_WIDTH;
  this.gameHeight = CONFIG.SCREEN_HEIGHT;
  this.controlHeight = 180;
  this.totalHeight = this.gameHeight + this.controlHeight;

  var scaleX = this.screenWidth / this.gameWidth;
  var scaleY = this.screenHeight / this.totalHeight;
  this.scale = Math.min(scaleX, scaleY);

  this.canvas.width = Math.floor(this.screenWidth * this.pixelRatio);
  this.canvas.height = Math.floor(this.screenHeight * this.pixelRatio);

  this.offsetX = (this.screenWidth - this.gameWidth * this.scale) / 2;
  this.offsetY = (this.screenHeight - this.totalHeight * this.scale) / 2;
};

Game.prototype.toGameX = function (screenX) {
  return (screenX - this.offsetX) / this.scale;
};

Game.prototype.toGameY = function (screenY) {
  return (screenY - this.offsetY) / this.scale;
};

Game.prototype.bindLifecycle = function () {
  var self = this;
  wx.onHide(function () {
    self.running = false;
  });
  wx.onShow(function () {
    self.running = true;
    self.lastTime = 0;
  });
};

Game.prototype.start = function () {
  if (wx.setPreferredFramesPerSecond) {
    wx.setPreferredFramesPerSecond(60);
  }
  this.startLoop();
};

Game.prototype.startLoop = function () {
  var self = this;
  var loop = function (timestamp) {
    if (self.running) {
      if (!self.lastTime) {
        self.lastTime = timestamp;
      }
      var dt = (timestamp - self.lastTime) / 1000;
      self.lastTime = timestamp;
      if (dt > 0.05) {
        dt = 0.05;
      }

      self.currentState.handleInput();
      self.currentState.update(dt);

      self.ctx.setTransform(1, 0, 0, 1, 0, 0);
      self.ctx.fillStyle = '#000';
      self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

      self.ctx.setTransform(
        self.scale * self.pixelRatio, 0,
        0, self.scale * self.pixelRatio,
        self.offsetX * self.pixelRatio,
        self.offsetY * self.pixelRatio
      );

      self.currentState.draw(self.ctx);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

Game.prototype.changeState = function (name, params) {
  this.currentState.exit();
  this.currentState = this.states[name];
  this.currentState.enter(params || {});
};

module.exports = Game;
