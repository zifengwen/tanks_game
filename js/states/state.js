"use strict";

function State(game) {
  this.game = game;
}

State.prototype.enter = function (params) {};

State.prototype.exit = function () {};

State.prototype.handleInput = function () {};

State.prototype.update = function (dt) {};

State.prototype.draw = function (ctx) {};

module.exports = State;
