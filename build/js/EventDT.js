;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.EventDT = factory();
  }
}(this, function() {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_moment2.default.locale('fr');

var EventDT = function () {
  function EventDT(id, label, start, end) {
    var description = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
    var actions = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    var status = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'draft';

    _classCallCheck(this, EventDT);

    this.id = id;

    // From ICS format
    this.uid = null;

    // ICS : summary
    this.label = label;

    // ICS : description
    this.description = description;

    // OSCAR
    this.editable = actions.editable || false;
    this.deletable = actions.deletable || false;
    this.validable = actions.validable || false;
    this.sendable = actions.sendable || false;

    this.status = status;

    // Status
    // - DRAFT, SEND, VALID, REJECT

    this.start = start;

    this.end = end;
  }

  /**
   * Retourne un objet moment pour la date de début.
   */


  _createClass(EventDT, [{
    key: "inWeek",


    /**
     * Test si l'événement est présent dans la semaine.
     * @return boolean
     */
    value: function inWeek(year, week) {
      var mmStart = this.mmStart.unix(),
          mmEnd = this.mmEnd.unix();

      // Récupération de la plage de la semaine
      var weekStart = (0, _moment2.default)().year(year).week(week).startOf('week'),
          plageStart = weekStart.unix(),
          plageFin = weekStart.endOf('week').unix();

      if (mmStart > plageFin || mmEnd < plageStart) return false;

      return mmStart < plageFin || mmEnd > plageStart;
    }
  }, {
    key: "isBefore",
    value: function isBefore(eventDT) {
      if (this.mmStart < eventDT.mmStart) {
        return true;
      }
      return false;
    }
  }, {
    key: "mmStart",
    get: function get() {
      return (0, _moment2.default)(this.start);
    }

    /**
     * Retourne un objet moment pour la date de fin.
     */

  }, {
    key: "mmEnd",
    get: function get() {
      return (0, _moment2.default)(this.end);
    }

    /**
     * Retourne la durée de l'événement en minutes.
     * @returns {number}
     */

  }, {
    key: "durationMinutes",
    get: function get() {
      return (this.mmEnd.unix() - this.mmStart.unix()) / 60;
    }

    /**
     * Retourne la durée de l'événement en heure.
     * @returns {number}
     */

  }, {
    key: "duration",
    get: function get() {
      return this.durationMinutes / 60;
    }
  }], [{
    key: "first",
    value: function first(events) {
      var first = null;
      events.forEach(function (e1) {
        if (first == null) {
          first = e1;
        } else {
          if (e1.isBefore(first)) {
            first = e1;
          }
        }
      });
      return first;
    }
  }, {
    key: "sortByStart",
    value: function sortByStart(events) {
      var sorted = events.sort(function (e1, e2) {
        if (e1.mmStart < e2.mmStart) return -1;else if (e1.mmStart > e2.mmStart) return 1;

        return 0;
      });
      return sorted;
    }
  }]);

  return EventDT;
}();
return EventDT;
}));
