;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Calendar = factory();
  }
}(this, function() {
"use strict";

var _WeekView;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventDT = require("EventDT");

var _EventDT2 = _interopRequireDefault(_EventDT);

var _momentTimezone = require("moment-timezone");

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _ICalAnalyser = require("ICalAnalyser");

var _ICalAnalyser2 = _interopRequireDefault(_ICalAnalyser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_momentTimezone2.default.locale('fr');

var colorLabels = [];
var colorpool = ['#4799f1', '#Fac01c', '#5460ad', '#7a0497', '#8a6d44', '#d10a92', '#ec0361', '#8befb0', '#ff6f4c', '#f1a7f2', '#de70e6', '#e7cec4', '#baf911', '#a5e46b', '#3ff466', '#64b641', '#21bc8d', '#2c8620', '#a77fea', '#fa1418', '#b4a068', '#F94112', '#F8f33a', '#eee162'];
var _colorLabel = function _colorLabel(label) {
    var index = colorLabels.indexOf(label);
    if (index == -1) {
        colorLabels.push(label);
        index = colorLabels.length - 1;
    }
    return colorpool[index % colorpool.length];
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// MODEL

var CalendarDatas = function () {
    function CalendarDatas() {
        _classCallCheck(this, CalendarDatas);

        this.state = 'list';
        this.events = [];
        this.newID = 1;
        this.eventEditData = null;
        this.currentDay = (0, _momentTimezone2.default)();
        this.eventEdit = null;
        this.eventEditData = null;
        this.copyWeekData = null;
        this.copyDayData = null;
        this.generatedId = 0;
        this.defaultLabel = "Nouvel événement";
        this.defaultDescription = "Description par défaut";
    }

    _createClass(CalendarDatas, [{
        key: "copyDay",
        value: function copyDay(dt) {
            var _this = this;

            this.copyDayData = [];
            var dDay = dt.format('MMMM D YYYY');
            this.events.forEach(function (event) {
                var dayRef = (0, _momentTimezone2.default)(event.start).format('MMMM D YYYY');
                if (dayRef == dDay) {
                    _this.copyDayData.push({
                        startHours: event.mmStart.hour(),
                        startMinutes: event.mmStart.minute(),
                        endHours: event.mmEnd.hour(),
                        endMinutes: event.mmEnd.minute(),
                        label: event.label,
                        description: event.description
                    });
                }
            });
            console.log(this.copyDayData);
        }
        ////////////////////////////////////////////////////////////////////////

    }, {
        key: "copyCurrentWeek",
        value: function copyCurrentWeek() {
            var _this2 = this;

            this.copyWeekData = [];
            this.events.forEach(function (event) {
                if (_this2.inCurrentWeek(event)) {
                    _this2.copyWeekData.push({
                        day: event.mmStart.day(),
                        startHours: event.mmStart.hour(),
                        startMinutes: event.mmStart.minute(),
                        endHours: event.mmEnd.hour(),
                        endMinutes: event.mmEnd.minute(),
                        label: event.label,
                        description: event.description
                    });
                }
            });
        }
    }, {
        key: "pasteDay",
        value: function pasteDay(day) {
            var _this3 = this;

            if (this.copyDayData) {
                this.copyDayData.forEach(function (event) {
                    var start = (0, _momentTimezone2.default)(day.format());
                    start.hour(event.startHours).minute(event.startMinutes);

                    var end = (0, _momentTimezone2.default)(day.format());
                    end.hour(event.endHours).minute(event.endMinutes);

                    _this3.newEvent(new _EventDT2.default(4, event.label, start.format(), end.format(), event.description, { editable: true, deletable: true }));
                });
            }
        }
    }, {
        key: "pasteWeek",
        value: function pasteWeek() {
            var _this4 = this;

            if (this.copyWeekData) {
                this.copyWeekData.forEach(function (event) {
                    var start = (0, _momentTimezone2.default)(_this4.currentDay);
                    start.day(event.day).hour(event.startHours).minute(event.startMinutes);

                    var end = (0, _momentTimezone2.default)(_this4.currentDay);
                    end.day(event.day).hour(event.endHours).minute(event.endMinutes);

                    _this4.newEvent(new _EventDT2.default(4, event.label, start.format(), end.format(), event.description, { editable: true, deletable: true }));
                });
            }
        }
    }, {
        key: "previousWeek",
        value: function previousWeek() {
            this.currentDay = (0, _momentTimezone2.default)(this.currentDay).add(-1, 'week');
        }
    }, {
        key: "nextWeek",
        value: function nextWeek() {
            this.currentDay = (0, _momentTimezone2.default)(this.currentDay).add(1, 'week');
        }
    }, {
        key: "newEvent",
        value: function newEvent(evt) {
            evt.id = this.generatedId++;
            this.events.push(evt);
        }
    }, {
        key: "inCurrentWeek",
        value: function inCurrentWeek(event) {
            return event.inWeek(this.currentDay.year(), this.currentDay.week());
        }
    }, {
        key: "addNewEvent",
        value: function addNewEvent(label, start, end, description) {
            var credentials = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
            var status = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "draft";

            this.events.push(new _EventDT2.default(this.newID++, label, start, end, description, credentials, status));
        }
    }, {
        key: "listEvents",
        get: function get() {
            _EventDT2.default.sortByStart(this.events);
            return this.events;
        }
    }, {
        key: "today",
        get: function get() {
            return (0, _momentTimezone2.default)();
        }
    }, {
        key: "currentYear",
        get: function get() {
            return this.currentDay.format('YYYY');
        }
    }, {
        key: "currentMonth",
        get: function get() {
            return this.currentDay.format('MMMM');
        }
    }, {
        key: "currentWeekKey",
        get: function get() {
            return this.currentDay.format('YYYY-W');
        }
    }, {
        key: "currentWeekDays",
        get: function get() {
            var days = [],
                day = (0, _momentTimezone2.default)(this.currentDay.startOf('week'));

            for (var i = 0; i < 7; i++) {
                days.push((0, _momentTimezone2.default)(day.format()));
                day.add(1, 'day');
            }
            return days;
        }
    }]);

    return CalendarDatas;
}();

var store = new CalendarDatas();

var TimeEvent = {

    template: "<div class=\"event\" :style=\"css\"\n            @mouseleave=\"handlerMouseOut\"\n            @mousedown=\"handlerMouseDown\"\n            :class=\"{'event-moving': moving, 'event-selected': selected, 'event-locked': isLocked, 'status-draft': isDraft, 'status-send' : isSend, 'status-valid': isValid, 'status-reject': isReject}\">\n        <div class=\"label\" data-uid=\"UID\">\n          {{ event.label }}\n        </div>\n        <div class=\"description\">\n            le {{ dateStart.format() }}\n          {{ event.description }}\n        </div>\n        <template v-if=\"event.editable\">\n        <nav class=\"admin\">\n            <a href=\"#\" @click.stop.prevent=\"$emit('edit')\">\n                <i class=\"icon-pencil-1\"></i>\n                Modifier</a>\n            <a href=\"#\" @click.stop.prevent=\"$emit('delete')\">\n                <i class=\"icon-trash-empty\"></i>\n                Supprimer</a>\n\n            <a href=\"#\" @click.stop.prevent=\"$emit('send')\">\n                <i class=\"icon-right-big\"></i>\n                Soumettre</a>\n        </nav>\n        <div class=\"bottom-handler\"\n            @mouseleave=\"handlerEndMovingEnd\"\n            @mousedown.prevent.stop=\"handlerStartMovingEnd\">\n            <span>===</span>\n        </div>\n        </template>\n        <time class=\"time start\">{{ labelStart }}</time>\n        <time class=\"time end\">{{ labelEnd }}</time>\n      </div>",

    props: ['event', 'weekDayRef'],

    data: function data() {
        return {
            selected: false,
            moving: false,
            interval: null,
            movingBoth: true,
            labelStart: "",
            labelEnd: "",
            startX: 0
        };
    },


    filters: {
        hour: function hour(mm) {
            return mm.format('H:mm');
        },
        dateFull: function dateFull(mm) {
            return mm.format('D MMMM YYYY, h:mm');
        }
    },

    computed: {
        css: function css() {
            return {
                height: this.pixelEnd - this.pixelStart + 'px',
                background: this.colorLabel,
                position: "absolute",
                top: this.pixelStart + 'px',
                width: 100 / 7 - 1 + "%",
                left: (this.weekDay - 1) * 100 / 7 + "%"
            };
        },


        ///////////////////////////////////////////////////////////////// STATUS
        isDraft: function isDraft() {
            return this.event.status == "draft";
        },
        isSend: function isSend() {
            return this.event.status == "send";
        },
        isValid: function isValid() {
            return this.event.status == "valid";
        },
        isReject: function isReject() {
            return this.event.status == "reject";
        },
        colorLabel: function colorLabel() {
            return _colorLabel(this.event.label);
        },
        isLocked: function isLocked() {
            return !this.event.editable;
        },
        dateStart: function dateStart() {
            return (0, _momentTimezone2.default)(this.event.start);
        },
        dateEnd: function dateEnd() {
            return (0, _momentTimezone2.default)(this.event.end);
        },
        pixelStart: function pixelStart() {
            return this.dateStart.hour() * 40 + 40 / 60 * this.dateStart.minutes();
        },
        pixelEnd: function pixelEnd() {
            return this.dateEnd.hour() * 40 + 40 / 60 * this.dateEnd.minutes();
        },
        weekDay: function weekDay() {
            return this.dateStart.day();
        }
    },

    watch: {
        'event.start': function eventStart() {
            this.labelStart = this.dateStart.format('H:mm');
        },
        'event.end': function eventEnd() {
            this.labelEnd = this.dateEnd.format('H:mm');
        }
    },

    methods: {
        move: function move(event) {
            if (this.event.editable) {

                var currentTop = parseInt(this.$el.style.top);
                var currentHeight = parseInt(this.$el.style.height);

                if (this.movingBoth) {
                    currentTop += event.movementY;
                    this.$el.style.top = currentTop + "px";
                } else {
                    currentHeight += event.movementY;
                    this.$el.style.height = currentHeight + "px";
                }

                var dtUpdate = this.topToStart();
                this.labelStart = dtUpdate.startLabel;
                this.labelEnd = dtUpdate.endLabel;
            }
        },
        handlerEndMovingEnd: function handlerEndMovingEnd() {
            this.movingBoth = false;
        },
        handlerStartMovingEnd: function handlerStartMovingEnd(e) {
            console.log('Déplacement de la fin');
            this.movingBoth = false;
            this.startMoving(e);
        },
        startMoving: function startMoving(e) {
            if (this.event.editable) {
                this.startX = e.clientX;
                this.selected = true;
                this.moving = true;
                this.$el.addEventListener('mousemove', this.move);
                this.$el.addEventListener('mouseup', this.handlerMouseUp);
            }
        },
        handlerMouseDown: function handlerMouseDown(e) {
            console.log('Déplacement intégral');
            this.movingBoth = true;
            this.startMoving(e);
        },
        handlerMouseUp: function handlerMouseUp(e) {
            if (this.event.editable) {
                this.moving = false;
                this.$el.removeEventListener('mousemove', this.move);

                var dtUpdate = this.topToStart();

                this.event.start = this.dateStart.hours(dtUpdate.startHours).minutes(dtUpdate.startMinutes).format();

                this.event.end = this.dateEnd.hours(dtUpdate.endHours).minutes(dtUpdate.endMinutes).format();
            }
        },
        handlerMouseOut: function handlerMouseOut(e) {
            console.log("Mouseout");
            this.handlerMouseUp();
        },
        roundMinutes: function roundMinutes(minutes) {
            return Math.floor(60 / 40 * minutes / 5) * 5;
        },
        formatZero: function formatZero(int) {
            return int < 10 ? '0' + int : int;
        },


        ////////////////////////////////////////////////////////////////////////
        topToStart: function topToStart() {
            var round = 40 / 12;

            var minutesStart = parseInt(this.$el.style.top);
            var minutesEnd = minutesStart + parseInt(this.$el.style.height);

            var startHours = Math.floor(minutesStart / 40);
            var startMinutes = this.roundMinutes(minutesStart - startHours * 40);

            var endHours = Math.floor(minutesEnd / 40);
            var endMinutes = this.roundMinutes(minutesEnd - endHours * 40);

            return {
                startHours: startHours,
                startMinutes: startMinutes,
                endHours: endHours,
                endMinutes: endMinutes,
                startLabel: this.formatZero(startHours) + ':' + this.formatZero(startMinutes),
                endLabel: this.formatZero(endHours) + ':' + this.formatZero(endMinutes)
            };
        }
    },

    mounted: function mounted() {
        this.labelStart = this.dateStart.format('H:mm');
        this.labelEnd = this.dateEnd.format('H:mm');
    }
};

var WeekView = (_WeekView = {
    data: function data() {
        return store;
    },


    components: {
        'timeevent': TimeEvent
    },

    template: "<div class=\"calendar calendar-week\">\n    <div class=\"meta\">\n        <a href=\"#\" @click=\"previousWeek\">\n            <i class=\"icon-left-big\"></i>\n        </a>\n        <h3>\n            semaine {{ currentWeekNum}}, {{ currentMonth }} {{ currentYear }}\n            <nav class=\"copy-paste\">\n                <span href=\"#\" @click=\"copyCurrentWeek\"><i class=\"icon-docs\"></i></span>\n                <span href=\"#\" @click=\"pasteWeek\"><i class=\"icon-paste\"></i></span>\n            </nav>\n        </h3>\n       <a href=\"#\" @click=\"nextWeek\">\n            <i class=\"icon-right-big\"></i>\n       </a>\n    </div>\n\n    <header class=\"line\">\n        <div class=\"content-full\" style=\"margin-right: 12px\">\n            <div class=\"labels-time\">\n                {{currentYear}}\n            </div>\n            <div class=\"events\">\n                <div class=\"cell cell-day day day-1\" v-for=\"day in currentWeekDays\">\n                    {{ day.format('dddd D') }}\n                    <nav class=\"copy-paste\">\n                        <span href=\"#\" @click=\"copyDay(day)\"><i class=\"icon-docs\"></i></span>\n                        <span href=\"#\" @click=\"pasteDay(day)\"><i class=\"icon-paste\"></i></span>\n                    </nav>\n                </div>\n            </div>\n        </div>\n    </header>\n\n    <div class=\"content-wrapper\">\n        <div class=\"content-full\">\n          <div class=\"labels-time\">\n            <div class=\"unit timeinfo\" v-for=\"time in 24\">{{time-1}}:00</div>\n          </div>\n          <div class=\"events\">\n\n              <div class=\"cell cell-day day\" v-for=\"day in 7\">\n                <div class=\"hour houroff\" v-for=\"time in 6\">&nbsp;</div>\n                <div class=\"hour\" v-for=\"time in 16\" @dblclick=\"createEvent(day, time+5)\">&nbsp;</div>\n                <div class=\"hour houroff\" v-for=\"time in 2\">&nbsp;</div>\n              </div>\n              <div class=\"content-events\">\n                <timeevent v-for=\"event in events\"\n                    :weekDayRef=\"currentDay\"\n                    v-if=\"inCurrentWeek(event)\"\n                    @delete=\"deleteEvent(event)\"\n                    @edit=\"editEvent(event)\"\n                    :event=\"event\"\n                    :key=\"event.id\"></timeevent>\n              </div>\n          </div>\n        </div>\n    </div>\n\n    <footer class=\"line\">\n      FOOTER\n    </footer>\n    </div>",

    methods: {
        inCurrentWeek: function inCurrentWeek(event) {
            return store.inCurrentWeek(event);
        }
    },

    computed: {
        currentYear: function currentYear() {
            return this.currentDay.format('YYYY');
        },
        currentMonth: function currentMonth() {
            return this.currentDay.format('MMMM');
        },
        currentWeekKey: function currentWeekKey() {
            return this.currentDay.format('YYYY-W');
        },
        currentWeekNum: function currentWeekNum() {
            return this.currentDay.format('W');
        },
        currentWeekDays: function currentWeekDays() {
            var days = [],
                day = (0, _momentTimezone2.default)(this.currentDay.startOf('week'));

            for (var i = 0; i < 7; i++) {
                days.push((0, _momentTimezone2.default)(day.format()));
                day.add(1, 'day');
            }
            return days;
        }
    }

}, _defineProperty(_WeekView, "methods", {
    copyDay: function copyDay(dt) {
        var _this5 = this;

        this.copyDayData = [];
        var dDay = dt.format('MMMM D YYYY');
        this.events.forEach(function (event) {
            var dayRef = (0, _momentTimezone2.default)(event.start).format('MMMM D YYYY');
            if (dayRef == dDay) {
                _this5.copyDayData.push({
                    startHours: event.mmStart.hour(),
                    startMinutes: event.mmStart.minute(),
                    endHours: event.mmEnd.hour(),
                    endMinutes: event.mmEnd.minute(),
                    label: event.label,
                    description: event.description
                });
            }
        });
        console.log(this.copyDayData);
    },

    ////////////////////////////////////////////////////////////////////////
    copyCurrentWeek: function copyCurrentWeek() {
        var _this6 = this;

        this.copyWeekData = [];
        this.events.forEach(function (event) {
            if (_this6.inCurrentWeek(event)) {
                _this6.copyWeekData.push({
                    day: event.mmStart.day(),
                    startHours: event.mmStart.hour(),
                    startMinutes: event.mmStart.minute(),
                    endHours: event.mmEnd.hour(),
                    endMinutes: event.mmEnd.minute(),
                    label: event.label,
                    description: event.description
                });
            }
        });
    },
    pasteDay: function pasteDay(day) {
        var _this7 = this;

        if (this.copyDayData) {
            this.copyDayData.forEach(function (event) {
                var start = (0, _momentTimezone2.default)(day.format());
                start.hour(event.startHours).minute(event.startMinutes);

                var end = (0, _momentTimezone2.default)(day.format());
                end.hour(event.endHours).minute(event.endMinutes);

                _this7.newEvent(new _EventDT2.default(4, event.label, start.format(), end.format(), event.description, { editable: true, deletable: true }));
            });
        }
    },
    pasteWeek: function pasteWeek() {
        var _this8 = this;

        if (this.copyWeekData) {
            this.copyWeekData.forEach(function (event) {
                var start = (0, _momentTimezone2.default)(_this8.currentDay);
                start.day(event.day).hour(event.startHours).minute(event.startMinutes);

                var end = (0, _momentTimezone2.default)(_this8.currentDay);
                end.day(event.day).hour(event.endHours).minute(event.endMinutes);

                _this8.newEvent(new _EventDT2.default(4, event.label, start.format(), end.format(), event.description, { editable: true, deletable: true }));
            });
        }
    },
    previousWeek: function previousWeek() {
        this.currentDay = (0, _momentTimezone2.default)(this.currentDay).add(-1, 'week');
    },
    nextWeek: function nextWeek() {
        this.currentDay = (0, _momentTimezone2.default)(this.currentDay).add(1, 'week');
    },
    newEvent: function newEvent(evt) {
        evt.id = this.generatedId++;
        this.events.push(evt);
    },
    inCurrentWeek: function inCurrentWeek(event) {
        return event.inWeek(this.currentDay.year(), this.currentDay.week());
    },
    deleteEvent: function deleteEvent(event) {
        this.events.splice(this.events.indexOf(event), 1);
    },
    createEvent: function createEvent(day, time) {
        var start = (0, _momentTimezone2.default)(this.currentDay).day(day).hour(time);
        var end = (0, _momentTimezone2.default)(start).add(2, 'hours');
        this.newEvent(new _EventDT2.default(1, this.defaultLabel, start.format(), end.format(), this.defaultDescription, { editable: true, deletable: true }));
    },
    editEvent: function editEvent(event) {
        this.eventEdit = event;
        this.eventEditData = JSON.parse(JSON.stringify(event));
    },
    editSave: function editSave() {
        this.defaultLabel = this.eventEdit.label = this.eventEditData.label;
        this.defaultDescription = this.eventEdit.description = this.eventEditData.description;
        this.eventEdit = this.eventEditData = null;
    },
    editCancel: function editCancel() {
        this.eventEdit = this.eventEditData = null;
    }
}), _defineProperty(_WeekView, "mounted", function mounted() {
    var wrapper = this.$el.querySelector('.content-wrapper');
    wrapper.scrollTop = 280;
}), _WeekView);

var MonthView = {
    data: function data() {
        return store;
    },

    template: "<div class=\"calendar calendar-month\">\n        <h2>Month view</h2>\n    </div>"
};

var ListItemView = {
    template: "<article class=\"list-item\" :style=\"css\" :class=\"cssClass\" @click=\"$emit('selectevent', event)\">\n        <time class=\"start\">{{ beginAt }}</time>\n        <strong>{{ event.label }}</strong>\n        <time class=\"end\">{{ endAt }}</time>\n    </article>",
    props: ['event'],
    computed: {
        beginAt: function beginAt() {
            return this.event.mmStart.format('HH:mm');
        },
        endAt: function endAt() {
            return this.event.mmEnd.format('HH:mm');
        },
        cssClass: function cssClass() {
            return 'status-' + this.event.status;
        },
        css: function css() {
            var percentUnit = 100 / (18 * 60),
                start = (this.event.mmStart.hour() - 6) * 60 + this.event.mmStart.minutes(),
                end = (this.event.mmEnd.hour() - 6) * 60 + this.event.mmEnd.minutes();

            return {
                left: percentUnit * start + '%',
                width: percentUnit * (end - start) + '%',
                background: _colorLabel(this.event.label)
            };
        }
    }
};

var ListView = _defineProperty({
    data: function data() {
        return store;
    },


    computed: {
        firstDate: function firstDate() {
            return store.firstEvent;
        },
        lastDate: function lastDate() {
            return store.firstEvent;
        }
    },

    components: {
        listitem: ListItemView
    },

    template: "<div class=\"calendar calendar-list\">\n        <h2>List view</h2>\n        <article v-for=\"pack in listEvents\">\n            <section class=\"events\">\n                <h3>{{ pack.label }}</h3>\n                <section class=\"events-list\">\n                <listitem @selectevent=\"selectEvent\" v-bind:event=\"event\" v-for=\"event in pack.events\"></listitem>\n                </section>\n                <div class=\"total\">\n                    {{ pack.totalHours }} heure(s)\n                </div>\n            </section>\n\n        </article>\n    </div>",

    methods: {
        selectEvent: function selectEvent(event) {
            store.currentDay = (0, _momentTimezone2.default)(event.start);
            store.state = "week";
        }
    }

}, "computed", {
    listEvents: function listEvents() {
        _EventDT2.default.sortByStart(this.events);
        var pack = [];
        var packerFormat = 'ddd D MMMM YYYY';
        var packer = null;

        var currentPack = null;

        if (!store.events) {
            return null;
        }

        for (var i = 0; i < this.events.length; i++) {
            var event = this.events[i];
            var label = event.mmStart.format(packerFormat);

            if (packer == null || packer.label != label) {
                packer = {
                    label: label,
                    events: [],
                    totalHours: 0
                };
                pack.push(packer);
            }
            packer.totalHours += event.duration;
            packer.events.push(event);
        }

        return pack;
    }
});

var Calendar = {

    template: "\n        <div class=\"calendar\">\n            <div class=\"editor\" v-if=\"eventEditData\">\n                <form @submit.prevent=\"editSave\">\n                    <div>\n                        <label for=\"\">Intitul\xE9</label>\n                        <input v-model=\"eventEditData.label\" />\n                    </div>\n                    <div>\n                        <label for=\"\">Description</label>\n                        <input v-model=\"eventEditData.description\" />\n                    </div>\n\n                    <button type=\"button\" @click=\"editCancel\">Annuler</button>\n                    <button type=\"cancel\">Enregistrer</button>\n                </form>\n            </div>\n\n            <nav class=\"views-switcher\">\n                <a href=\"#\" @click.prevent=\"state = 'week'\"><i class=\"icon-calendar\"></i>{{ trans.labelViewWeek }}</a>\n                <a href=\"#\" @click.prevent=\"state = 'month'\"><i class=\"icon-table\"></i>{{ trans.labelViewMonth }}</a>\n                <a href=\"#\" @click.prevent=\"state = 'list'\"><i class=\"icon-columns\"></i>{{ trans.labelViewList }}</a>\n                <input type=\"file\" @change=\"loadIcsFile\">\n            </nav>\n            <monthview v-show=\"state == 'month'\"></monthview>\n            <weekview v-show=\"state == 'week'\"></weekview>\n            <listview v-show=\"state == 'list'\"></listview>\n        </div>\n\n    ",

    data: function data() {
        return store;
    },


    props: {
        // Texts
        trans: {
            default: function _default() {
                return {
                    labelViewWeek: "Semaine",
                    labelViewMonth: "Mois",
                    labelViewList: "Liste"
                };
            }
        }
    },

    components: {
        weekview: WeekView,
        monthview: MonthView,
        listview: ListView
    },

    methods: {
        loadIcsFile: function loadIcsFile(e) {
            var _this9 = this;

            var fr = new FileReader();
            fr.onloadend = function (result) {
                _this9.parseFileContent(fr.result);
            };
            fr.readAsText(e.target.files[0]);
        },
        parseFileContent: function parseFileContent(content) {
            var analyser = new _ICalAnalyser2.default();
            this.hydrateEventWith(analyser.parse(ICAL.parse(content)));
        },
        hydrateEventWith: function hydrateEventWith(arrayOfObj) {
            arrayOfObj.forEach(function (obj) {
                store.addNewEvent(obj.summary, obj.start, obj.end, obj.description, { editable: true, deletable: true }, 'draft');
            });
        },
        deleteEvent: function deleteEvent(event) {
            this.events.splice(this.events.indexOf(event), 1);
        },
        createEvent: function createEvent(day, time) {
            var start = (0, _momentTimezone2.default)(this.currentDay).day(day).hour(time);
            var end = (0, _momentTimezone2.default)(start).add(2, 'hours');
            this.newEvent(new _EventDT2.default(1, this.defaultLabel, start.format(), end.format(), this.defaultDescription, { editable: true, deletable: true }));
        },
        editEvent: function editEvent(event) {
            this.eventEdit = event;
            this.eventEditData = JSON.parse(JSON.stringify(event));
        },
        editSave: function editSave() {
            this.defaultLabel = this.eventEdit.label = this.eventEditData.label;
            this.defaultDescription = this.eventEdit.description = this.eventEditData.description;
            this.eventEdit = this.eventEditData = null;
        },
        editCancel: function editCancel() {
            this.eventEdit = this.eventEditData = null;
        }
    },

    mounted: function mounted() {
        console.log('Mounted !', this);
        if (this.fetch) this.fetch();
        /*
        store.addNewEvent('Item D',
            "2017-03-16T13:30", "2017-03-16T17:45", "Envoyée (à valider)",
            { editable: true, deletable: true},
            'draft');
         store.addNewEvent('Item D',
            "2017-03-16T08:30", "2017-03-16T12:45", "Envoyée (à valider)",
            { editable: true, deletable: true},
            'draft');
         store.addNewEvent('Item B',
            "2017-03-14T13:30", "2017-03-14T17:45", "Envoyée (à valider)",
            { editable: true, deletable: true},
            'draft');
         store.addNewEvent('Item B',
            "2017-03-14T08:30", "2017-03-14T12:45", "Envoyée (à valider)",
            { editable: true, deletable: true},
            'draft');
         store.addNewEvent('Item C',
            "2017-03-15T13:30", "2017-03-15T17:45", "Envoyée (à valider)",
            { editable: true, deletable: true},
            'draft');
         store.addNewEvent('Item C',
            "2017-03-15T08:30", "2017-03-15T12:45", "Envoyée (à valider)",
            { editable: true, deletable: true},
            'draft');
         store.addNewEvent('Item A',
            "2017-03-13T13:30", "2017-03-13T17:45", "Envoyée (à valider)",
            { editable: true, deletable: true},
            'draft');
         store.addNewEvent('Item A',
            "2017-03-13T08:30", "2017-03-13T12:45", "Envoyée (à valider)",
            { editable: true, deletable: true},
            'draft');
        /****/
    }
};
return Calendar;
}));
