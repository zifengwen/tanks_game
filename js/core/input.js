"use strict";

var CONFIG = require('../config');

function InputManager(game) {
  this.game = game;
  this.touches = {};
  this.tap = false;

  this.dpadCenter = { x: 95, y: CONFIG.SCREEN_HEIGHT + 110 };
  this.dpadRadius = 72;
  this.deadZone = 18;
  this.fireCenter = { x: 321, y: CONFIG.SCREEN_HEIGHT + 110 };
  this.fireRadius = 55;

  this.dpadTouchId = null;
  this.fireTouchId = null;
  this.dpadDirection = null;
  this.firePressed = false;

  this.bindEvents();
}

InputManager.prototype.bindEvents = function () {
  var self = this;
  wx.onTouchStart(function (e) { self.onTouchStart(e); });
  wx.onTouchMove(function (e) { self.onTouchMove(e); });
  wx.onTouchEnd(function (e) { self.onTouchEnd(e); });
  wx.onTouchCancel(function (e) { self.onTouchEnd(e); });
};

InputManager.prototype.onTouchStart = function (e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    var gx = this.game.toGameX(t.clientX);
    var gy = this.game.toGameY(t.clientY);
    var id = t.identifier;
    this.touches[id] = { x: gx, y: gy };

    if (this.dpadTouchId === null && this.inCircle(gx, gy, this.dpadCenter, this.dpadRadius)) {
      this.dpadTouchId = id;
      this.updateDpadDirection(gx, gy);
    } else if (this.fireTouchId === null && this.inCircle(gx, gy, this.fireCenter, this.fireRadius)) {
      this.fireTouchId = id;
      this.firePressed = true;
    } else if (this.dpadTouchId !== id && this.fireTouchId !== id) {
      this.tap = true;
    }
  }
};

InputManager.prototype.onTouchMove = function (e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    var id = t.identifier;
    if (!this.touches.hasOwnProperty(id)) {
      continue;
    }
    var gx = this.game.toGameX(t.clientX);
    var gy = this.game.toGameY(t.clientY);
    this.touches[id] = { x: gx, y: gy };
    if (id === this.dpadTouchId) {
      this.updateDpadDirection(gx, gy);
    }
  }
};

InputManager.prototype.onTouchEnd = function (e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    var id = t.identifier;
    delete this.touches[id];
    if (id === this.dpadTouchId) {
      this.dpadTouchId = null;
      this.dpadDirection = null;
    }
    if (id === this.fireTouchId) {
      this.fireTouchId = null;
      this.firePressed = false;
    }
  }
};

InputManager.prototype.inCircle = function (x, y, c, r) {
  var dx = x - c.x;
  var dy = y - c.y;
  return dx * dx + dy * dy <= r * r;
};

InputManager.prototype.updateDpadDirection = function (x, y) {
  var dx = x - this.dpadCenter.x;
  var dy = y - this.dpadCenter.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < this.deadZone) {
    this.dpadDirection = null;
    return;
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    this.dpadDirection = dx > 0 ? CONFIG.DIR_RIGHT : CONFIG.DIR_LEFT;
  } else {
    this.dpadDirection = dy > 0 ? CONFIG.DIR_DOWN : CONFIG.DIR_UP;
  }
};

InputManager.prototype.consumeTap = function () {
  if (this.tap) {
    this.tap = false;
    return true;
  }
  return false;
};

module.exports = InputManager;
