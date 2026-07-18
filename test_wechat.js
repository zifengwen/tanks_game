"use strict";

// 为在 Node.js 中做快速冒烟测试而提供的 wx/Canvas 桩。
// 该文件不会被微信小游戏执行。

function createContext2D() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    globalAlpha: 1,
    fillRect: function () {},
    clearRect: function () {},
    strokeRect: function () {},
    fillText: function () {},
    strokeText: function () {},
    beginPath: function () {},
    moveTo: function () {},
    lineTo: function () {},
    closePath: function () {},
    arc: function () {},
    fill: function () {},
    stroke: function () {},
    save: function () {},
    restore: function () {},
    translate: function () {},
    rotate: function () {},
    scale: function () {},
    drawImage: function () {},
    setTransform: function () {}
  };
}

function createCanvas(width, height) {
  return {
    width: width || 375,
    height: height || 667,
    getContext: function (type) {
      if (type === '2d') {
        return createContext2D();
      }
      return null;
    }
  };
}

global.wx = {
  createCanvas: function () {
    return createCanvas(375, 667);
  },
  getWindowInfo: function () {
    return {
      windowWidth: 375,
      windowHeight: 667,
      pixelRatio: 2
    };
  },
  getSystemInfoSync: function () {
    return {
      windowWidth: 375,
      windowHeight: 667,
      pixelRatio: 2
    };
  },
  setPreferredFramesPerSecond: function () {},
  onTouchStart: function () {},
  onTouchMove: function () {},
  onTouchEnd: function () {},
  onTouchCancel: function () {},
  onHide: function () {},
  onShow: function () {}
};

global.requestAnimationFrame = function (cb) {
  setTimeout(function () {
    cb(Date.now());
  }, 0);
};

var Game = require('./js/core/game');

function runSmokeTest() {
  var game = new Game();
  game.changeState('play', { levelIndex: 1 });

  for (var i = 0; i < 10; i++) {
    game.currentState.handleInput();
    game.currentState.update(1 / 60);
    game.ctx.setTransform(1, 0, 0, 1, 0, 0);
    game.ctx.setTransform(
      game.scale * game.pixelRatio, 0,
      0, game.scale * game.pixelRatio,
      game.offsetX * game.pixelRatio,
      game.offsetY * game.pixelRatio
    );
    game.currentState.draw(game.ctx);
  }

  console.log('WECHAT_SMOKE_TEST_OK');
}

runSmokeTest();
