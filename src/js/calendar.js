import EventDT from "EventDT";
import moment from "moment-timezone"
import ICalAnalyser from "ICalAnalyser";

moment.locale('fr');


var colorLabels = [];
var colorpool = ['#Fac01c','#4799f1','#64b641','#fa1418','#F8f33a','#ec0361','#8befb0','#5460ad','#8a6d44','#7a0497','#a5e46b','#21bc8d','#de70e6','#e7cec4','#d10a92','#ff6f4c','#F94112','#f1a7f2','#baf911','#a77fea','#3ff466','#b4a068','#2c8620','#eee162'];
var colorLabel = (label) => {
    var index = colorLabels.indexOf(label);
    if( index == -1 ){
        colorLabels.push(label);
        index = colorLabels.length -1;
    }
    return colorpool[index%colorpool.length];
};



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// MODEL

class CalendarDatas {
    constructor(){
        this.state = 'week';
        this.events = [];
        this.newID = 1;
        this.eventEditData = null;
        this.currentDay = moment()
        this.eventEdit = null;
        this.eventEditData = null;
        this.copyWeekData = null;
        this.copyDayData = null;
        this.generatedId = 0;
        this.defaultLabel = "Nouvel événement";
        this.defaultDescription = "";
    }

    get listEvents(){
        EventDT.sortByStart(this.events);
        return this.events;
    }

    get today(){
        return moment();
    }

    get firstEvent(){

    }

    get lastEvent(){

    }


    get currentYear(){
        return this.currentDay.format('YYYY')
    }

    get currentMonth(){
        return this.currentDay.format('MMMM')
    }

    get currentWeekKey(){
        return this.currentDay.format('YYYY-W')
    }

    get currentWeekDays(){
        let days = [], day = moment(this.currentDay.startOf('week'));

        for( let i = 0; i<7; i++ ){
            days.push(moment(day.format()));
            day.add(1, 'day');
        }
        return days;
    }

    copyDay(dt){
        this.copyDayData = [];
        var dDay = dt.format('MMMM D YYYY');
        this.events.forEach((event) => {
            var dayRef = moment(event.start).format('MMMM D YYYY');
            if( dayRef == dDay ){
                this.copyDayData.push(
                    {
                        startHours: event.mmStart.hour(),
                        startMinutes: event.mmStart.minute(),
                        endHours: event.mmEnd.hour(),
                        endMinutes: event.mmEnd.minute(),
                        label: event.label,
                        description: event.description
                    }
                );
            }
        });
        console.log(this.copyDayData);
    }
    ////////////////////////////////////////////////////////////////////////
    copyCurrentWeek(){
        this.copyWeekData = [];
        this.events.forEach((event) => {
            if( this.inCurrentWeek(event) ){
                this.copyWeekData.push({
                    day: event.mmStart.day(),
                    startHours: event.mmStart.hour(),
                    startMinutes: event.mmStart.minute(),
                    endHours: event.mmEnd.hour(),
                    endMinutes: event.mmEnd.minute(),
                    label: event.label,
                    description: event.description
                });
            }
        })
    }

    pasteDay(day){
        if( this.copyDayData ){
            this.copyDayData.forEach((event) => {
                var start = moment(day.format());
                start.hour(event.startHours).minute(event.startMinutes);

                var end = moment(day.format());
                end.hour(event.endHours).minute(event.endMinutes);

                this.newEvent(new EventDT(4, event.label,
                    start.format(), end.format(),
                    event.description,
                    {editable: true, deletable: true}));
            });
        }
    }

    pasteWeek(){
        if( this.copyWeekData ){
            this.copyWeekData.forEach((event) => {
                var start = moment(this.currentDay);
                start.day(event.day).hour(event.startHours).minute(event.startMinutes);

                var end = moment(this.currentDay);
                end.day(event.day).hour(event.endHours).minute(event.endMinutes);

                this.newEvent(new EventDT(4,
                    event.label,
                    start.format(),
                    end.format(),
                    event.description,
                    {editable: true, deletable: true})
                );
            });
        }
    }

    previousWeek(){
        this.currentDay = moment(this.currentDay).add(-1, 'week');
    }

    nextWeek(){
        this.currentDay = moment(this.currentDay).add(1, 'week');
    }

    newEvent(evt){
        evt.id = this.generatedId++;
        this.events.push(evt)
    }

    inCurrentWeek(event){
        return event.inWeek(this.currentDay.year(), this.currentDay.week());
    }

    addNewEvent(label, start, end, description, credentials = null, status="draft"){
        this.events.push(
            new EventDT(
                this.newID++,
                label,
                start, end,
                description,
                credentials,
                status
            )
        );
    }
}
var store = new CalendarDatas();


var TimeEvent = {

    template: `<div class="event" :style="css"
            @mouseleave="handlerMouseOut"
            @mousedown="handlerMouseDown"
            :class="{'event-moving': moving, 'event-selected': selected, 'event-locked': isLocked, 'status-draft': isDraft, 'status-send' : isSend, 'status-valid': isValid, 'status-reject': isReject}">
        <div class="label" data-uid="UID">
          {{ event.label }}
        </div>
        <div class="description">
            le {{ dateStart.format() }}
          {{ event.description }}
        </div>
        <template v-if="event.editable">
        <nav class="admin">
            <a href="#" @click.stop.prevent="$emit('edit')">
                <i class="icon-pencil-1"></i>
                Modifier</a>
            <a href="#" @click.stop.prevent="$emit('delete')">
                <i class="icon-trash-empty"></i>
                Supprimer</a>

            <a href="#" @click.stop.prevent="$emit('send')">
                <i class="icon-right-big"></i>
                Soumettre</a>
        </nav>
        <div class="bottom-handler"
            @mouseleave="handlerEndMovingEnd"
            @mousedown.prevent.stop="handlerStartMovingEnd">
            <span>===</span>
        </div>
        </template>
        <time class="time start">{{ labelStart }}</time>
        <time class="time end">{{ labelEnd }}</time>
      </div>`,

    props: ['event', 'weekDayRef'],

    data(){
        return {
            selected: false,
            moving: false,
            interval: null,
            movingBoth: true,
            labelStart: "",
            labelEnd: "",
            startX: 0
        }
    },

    filters: {
        hour(mm){
            return mm.format('H:mm')
        },
        dateFull(mm){
            return mm.format('D MMMM YYYY, h:mm')
        }
    },

    computed: {
        css(){
            return {
                height: (this.pixelEnd - this.pixelStart) + 'px',
                background: this.colorLabel,
                position: "absolute",
                top: this.pixelStart + 'px',
                width: ((100 / 7)-1) + "%",
                left: ((this.weekDay-1) * 100 / 7) + "%"
            }
        },

        ///////////////////////////////////////////////////////////////// STATUS
        isDraft(){
            return this.event.status == "draft";
        },
        isSend(){
            return this.event.status == "send";
        },
        isValid(){
            return this.event.status == "valid";
        },
        isReject(){
            return this.event.status == "reject";
        },

        colorLabel(){
            return colorLabel(this.event.label);
        },

        isLocked(){
            return !this.event.editable;
        },

        dateStart(){
            return moment(this.event.start);
        },

        dateEnd(){
            return moment(this.event.end);
        },

        pixelStart(){
            return this.dateStart.hour() * 40 + (40 / 60 * this.dateStart.minutes());
        },

        pixelEnd(){
            return this.dateEnd.hour() * 40 + (40 / 60 * this.dateEnd.minutes());
        },

        weekDay(){
            return this.dateStart.day()
        }
    },

    watch: {
        'event.start': function(){
            this.labelStart = this.dateStart.format('H:mm');
        },
        'event.end': function(){
            this.labelEnd = this.dateEnd.format('H:mm');
        }
    },

    methods: {
        move(event){
            if( this.event.editable ) {

                var currentTop = parseInt(this.$el.style.top);
                var currentHeight = parseInt(this.$el.style.height);

                if( this.movingBoth ) {
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

        handlerEndMovingEnd(){
            this.movingBoth = false;
        },

        handlerStartMovingEnd(e){
            console.log('Déplacement de la fin');
            this.movingBoth = false;
            this.startMoving(e);
        },

        startMoving(e){
            if( this.event.editable ) {
                this.startX = e.clientX;
                this.selected = true;
                this.moving = true;
                this.$el.addEventListener('mousemove', this.move);
                this.$el.addEventListener('mouseup', this.handlerMouseUp);
            }
        },

        handlerMouseDown(e){
            console.log('Déplacement intégral');
            this.movingBoth = true;
            this.startMoving(e);

        },

        handlerMouseUp(e){
            if( this.event.editable ) {
                this.moving = false;
                this.$el.removeEventListener('mousemove', this.move);

                var dtUpdate = this.topToStart();

                this.event.start = this.dateStart
                    .hours(dtUpdate.startHours)
                    .minutes(dtUpdate.startMinutes)
                    .format();

                this.event.end = this.dateEnd
                    .hours(dtUpdate.endHours)
                    .minutes(dtUpdate.endMinutes)
                    .format()
            }
        },

        handlerMouseOut(e){
            console.log("Mouseout")
            this.handlerMouseUp()
        },

        roundMinutes(minutes){
            return Math.floor(60/40*minutes/5)*5
        },

        formatZero(int){
            return int < 10 ? '0'+int : int;
        },

        ////////////////////////////////////////////////////////////////////////
        topToStart(){
            var round = 40/12;

            var minutesStart = parseInt(this.$el.style.top);
            var minutesEnd = minutesStart + parseInt(this.$el.style.height);

            var startHours = Math.floor(minutesStart/40);
            var startMinutes = this.roundMinutes(minutesStart - startHours*40);

            var endHours = Math.floor(minutesEnd/40);
            var endMinutes = this.roundMinutes(minutesEnd- endHours*40);

            return {
                startHours: startHours,
                startMinutes: startMinutes,
                endHours: endHours,
                endMinutes: endMinutes,
                startLabel: this.formatZero(startHours)+':'+this.formatZero(startMinutes),
                endLabel: this.formatZero(endHours)+':'+this.formatZero(endMinutes)
            };
        }
    },

    mounted(){
        this.labelStart = this.dateStart.format('H:mm');
        this.labelEnd = this.dateEnd.format('H:mm');
    }
};

var WeekView = {
    data(){
        return store
    },

    components: {
        'timeevent': TimeEvent
    },

    template: `<div class="calendar calendar-week">
    <div class="meta">
        <a href="#" @click="previousWeek">
            <i class="icon-left-big"></i>
        </a>
        <h3>
            semaine {{ currentWeekNum}}, {{ currentMonth }} {{ currentYear }}
            <nav class="copy-paste">
                <span href="#" @click="copyCurrentWeek"><i class="icon-docs"></i></span>
                <span href="#" @click="pasteWeek"><i class="icon-paste"></i></span>
            </nav>
        </h3>
       <a href="#" @click="nextWeek">
            <i class="icon-right-big"></i>
       </a>
    </div>

    <header class="line">
        <div class="content-full" style="margin-right: 12px">
            <div class="labels-time">
                {{currentYear}}
            </div>
            <div class="events">
                <div class="cell cell-day day day-1" :class="{today: isToday(day)}" v-for="day in currentWeekDays">
                    {{ day.format('dddd D') }}
                    <nav class="copy-paste">
                        <span href="#" @click="copyDay(day)"><i class="icon-docs"></i></span>
                        <span href="#" @click="pasteDay(day)"><i class="icon-paste"></i></span>
                    </nav>
                </div>
            </div>
        </div>
    </header>

    <div class="content-wrapper">
        <div class="content-full">
          <div class="labels-time">
            <div class="unit timeinfo" v-for="time in 24">{{time-1}}:00</div>
          </div>
          <div class="events">

              <div class="cell cell-day day" v-for="day in 7">
                <div class="hour houroff" v-for="time in 6">&nbsp;</div>
                <div class="hour" v-for="time in 16" @dblclick="createEvent(day, time+5)">&nbsp;</div>
                <div class="hour houroff" v-for="time in 2">&nbsp;</div>
              </div>
              <div class="content-events">
                <timeevent v-for="event in events"
                    :weekDayRef="currentDay"
                    v-if="inCurrentWeek(event)"
                    @delete="deleteEvent(event)"
                    @edit="editEvent(event)"
                    :event="event"
                    :key="event.id"></timeevent>
              </div>
          </div>
        </div>
    </div>

    <footer class="line">
      FOOTER
    </footer>
    </div>`,

    methods: {
        inCurrentWeek(event){
            return store.inCurrentWeek(event)
        }
    },

    computed: {
        currentYear(){
            return this.currentDay.format('YYYY')
        },
        currentMonth(){
            return this.currentDay.format('MMMM')
        },
        currentWeekKey(){
            return this.currentDay.format('YYYY-W')
        },
        currentWeekNum(){
            return this.currentDay.format('W')
        },
        currentWeekDays(){
            let days = [], day = moment(this.currentDay.startOf('week'));

            for( let i = 0; i<7; i++ ){
                days.push(moment(day.format()));
                day.add(1, 'day');
            }
            return days;
        }
    },

    methods: {
        copyDay(dt){
            this.copyDayData = [];
            var dDay = dt.format('MMMM D YYYY');
            this.events.forEach((event) => {
                var dayRef = moment(event.start).format('MMMM D YYYY');
                if( dayRef == dDay ){
                    this.copyDayData.push(
                        {
                            startHours: event.mmStart.hour(),
                            startMinutes: event.mmStart.minute(),
                            endHours: event.mmEnd.hour(),
                            endMinutes: event.mmEnd.minute(),
                            label: event.label,
                            description: event.description
                        }
                    );
                }
            });
            console.log(this.copyDayData);
        },
        ////////////////////////////////////////////////////////////////////////
        copyCurrentWeek(){
            this.copyWeekData = [];
            this.events.forEach((event) => {
                if( this.inCurrentWeek(event) ){
                    this.copyWeekData.push({
                        day: event.mmStart.day(),
                        startHours: event.mmStart.hour(),
                        startMinutes: event.mmStart.minute(),
                        endHours: event.mmEnd.hour(),
                        endMinutes: event.mmEnd.minute(),
                        label: event.label,
                        description: event.description
                    });
                }
            })
        },

        pasteDay(day){
            if( this.copyDayData ){
                this.copyDayData.forEach((event) => {
                    var start = moment(day.format());
                    start.hour(event.startHours).minute(event.startMinutes);

                    var end = moment(day.format());
                    end.hour(event.endHours).minute(event.endMinutes);

                    this.newEvent(new EventDT(4, event.label,
                        start.format(), end.format(),
                        event.description,
                        {editable: true, deletable: true}));
                });
            }
        },

        pasteWeek(){
            if( this.copyWeekData ){
                this.copyWeekData.forEach((event) => {
                    var start = moment(this.currentDay);
                    start.day(event.day).hour(event.startHours).minute(event.startMinutes);

                    var end = moment(this.currentDay);
                    end.day(event.day).hour(event.endHours).minute(event.endMinutes);

                    this.newEvent(new EventDT(4,
                        event.label,
                        start.format(),
                        end.format(),
                        event.description,
                        {editable: true, deletable: true})
                    );
                });
            }
        },

        previousWeek(){
            this.currentDay = moment(this.currentDay).add(-1, 'week');
        },

        nextWeek(){
            this.currentDay = moment(this.currentDay).add(1, 'week');
        },

        isToday( day ){
            return day.format('YYYY-MM-DD') == store.today.format('YYYY-MM-DD');
        },

        newEvent(evt){
            evt.id = this.generatedId++;
            this.events.push(evt)
        },

        inCurrentWeek(event){
            return event.inWeek(this.currentDay.year(), this.currentDay.week());
        },

        deleteEvent(event){
            this.events.splice(this.events.indexOf(event), 1);
        },

        createEvent(day,time){
            var start = moment(this.currentDay).day(day).hour(time);
            var end = moment(start).add(2, 'hours');
            this.newEvent(new EventDT(1, this.defaultLabel, start.format(), end.format(), this.defaultDescription, { editable: true, deletable: true}));
        },

        editEvent(event){
            this.eventEdit = event;
            this.eventEditData = JSON.parse(JSON.stringify(event));
        },

        editSave(){
            this.defaultLabel = this.eventEdit.label = this.eventEditData.label;
            this.defaultDescription = this.eventEdit.description = this.eventEditData.description;
            this.eventEdit = this.eventEditData = null;
        },

        editCancel(){
            this.eventEdit = this.eventEditData = null;
        }
    },

    // Lorsque le composant est créé
    mounted(){
        var wrapper = this.$el.querySelector('.content-wrapper');
        wrapper.scrollTop = 280;
    }
};

var MonthView = {
    data(){
        return store
    },
    template: `<div class="calendar calendar-month">
        <h2>Month view</h2>
    </div>`
};

var ListItemView = {
    template: `<article class="list-item" :style="css" :class="cssClass" @click="$emit('selectevent', event)">
        <time class="start">{{ beginAt }}</time>
        <strong>{{ event.label }}</strong>
        <time class="end">{{ endAt }}</time>
    </article>`,
    props: ['event'],
    computed: {
        beginAt(){
            return this.event.mmStart.format('HH:mm');
        },
        endAt(){
            return this.event.mmEnd.format('HH:mm');
        },
        cssClass(){
            return 'status-' + this.event.status;
        },
        css(){
            var percentUnit = 100 / (18*60)
                , start = (this.event.mmStart.hour()-6)*60 + this.event.mmStart.minutes()
                , end = (this.event.mmEnd.hour()-6)*60 + this.event.mmEnd.minutes();

            return {
                left: (percentUnit * start) +'%',
                width: (percentUnit * (end - start)) +'%',
                background: colorLabel(this.event.label)
            }
        }
    }
};

var ListView = {
    data(){
        return store
    },

    computed: {
        firstDate(){
            return store.firstEvent;
        },
        lastDate(){
            return store.lastEvent;
        },
    },

    components: {
        listitem: ListItemView
    },

    template: `<div class="calendar calendar-list">
        <h2>List view</h2>
        <article v-for="pack in listEvents">
            <section class="events">
                <h3>{{ pack.label }}</h3>
                <section class="events-list">
                <listitem @selectevent="selectEvent" v-bind:event="event" v-for="event in pack.events"></listitem>
                </section>
                <div class="total">
                    {{ pack.totalHours }} heure(s)
                </div>
            </section>

        </article>
    </div>`,

    methods: {
        selectEvent(event){
            store.currentDay = moment(event.start);
            store.state = "week";
        }
    },

    computed: {
        listEvents(){
            EventDT.sortByStart(this.events);
            var pack = [];
            var packerFormat = 'ddd D MMMM YYYY';
            var packer = null;

            var currentPack = null;

            if( !store.events ){
                return null
            }

            for( let i=0; i<this.events.length; i++ ){
                let event = this.events[i];
                let label = event.mmStart.format(packerFormat);

                if( packer == null || packer.label != label ){
                    packer = {
                        label: label,
                        events: [],
                        totalHours: 0
                    }
                    pack.push(packer);
                }
                packer.totalHours += event.duration;
                packer.events.push(event);
            }

            return pack;
        }
    }
};

var Calendar = {

    template: `
        <div class="calendar">
            <div class="editor" v-if="eventEditData">
                <form @submit.prevent="editSave">
                    <div>
                        <label for="">Intitulé</label>
                        <input v-model="eventEditData.label" />
                    </div>
                    <div>
                        <label for="">Description</label>
                        <input v-model="eventEditData.description" />
                    </div>

                    <button type="button" @click="editCancel">Annuler</button>
                    <button type="cancel">Enregistrer</button>
                </form>
            </div>

            <nav class="views-switcher">
                <a href="#" @click.prevent="state = 'week'"><i class="icon-calendar"></i>{{ trans.labelViewWeek }}</a>
                <a href="#" @click.prevent="state = 'list'"><i class="icon-columns"></i>{{ trans.labelViewList }}</a>
                <input type="file" @change="loadIcsFile">
            </nav>
            <weekview v-show="state == 'week'"></weekview>
            <listview v-show="state == 'list'"></listview>
        </div>

    `,

    //                <!-- <a href="#" @click.prevent="state = 'month'"><i class="icon-table"></i>{{ trans.labelViewMonth }}</a> -->            <monthview v-show="state == 'month'"></monthview>

    data(){
        return store
    },

    props: {
        // Texts
        trans: {
            default() { return {
                labelViewWeek: "Semaine",
                labelViewMonth: "Mois",
                labelViewList: "Liste"
            }}
        }
    },

    components: {
        weekview: WeekView,
        monthview: MonthView,
        listview: ListView
    },

    methods: {



        loadIcsFile(e){
            var fr = new FileReader();
            fr.onloadend = (result)=> {
                this.parseFileContent(fr.result);
            };
            fr.readAsText(e.target.files[0]);
        },

        parseFileContent(content){
            var analyser = new ICalAnalyser();
            this.hydrateEventWith(analyser.parse(ICAL.parse(content)));
        },

        hydrateEventWith(arrayOfObj){
          arrayOfObj.forEach((obj) => {
              store.addNewEvent(obj.summary,
                  obj.start, obj.end, obj.description,
                  { editable: true, deletable: true},
                  'draft');
          })
        },

        deleteEvent(event){
            this.events.splice(this.events.indexOf(event), 1);
        },

        createEvent(day,time){
            var start = moment(this.currentDay).day(day).hour(time);
            var end = moment(start).add(2, 'hours');
            this.newEvent(new EventDT(1, this.defaultLabel, start.format(), end.format(), this.defaultDescription, { editable: true, deletable: true}));
        },

        editEvent(event){
            this.eventEdit = event;
            this.eventEditData = JSON.parse(JSON.stringify(event));
        },

        editSave(){
            this.defaultLabel = this.eventEdit.label = this.eventEditData.label;
            this.defaultDescription = this.eventEdit.description = this.eventEditData.description;
            this.eventEdit = this.eventEditData = null;
        },

        editCancel(){
            this.eventEdit = this.eventEditData = null;
        }
    },

    mounted(){
        if( this.fetch ) this.fetch();
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
