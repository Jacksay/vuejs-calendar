;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.EventDTStore = factory();
  }
}(this, function() {
"use strict";

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _EventDT = require("EventDT");

var _EventDT2 = _interopRequireDefault(_EventDT);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_moment2.default.locale('fr');

var EventDTStore = function EventDTStore() {
    _classCallCheck(this, EventDTStore);
};
return EventDTStore;
}));
