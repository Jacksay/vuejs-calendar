import EventDT from "EventDT";
import moment from "moment";

var TimeEvent = {

    template: `<div class="event" :style="css">
        <div class="label" data-uid="UID">
          {{ event.label }}
        </div>
        <div class="description">
          {{ event.description }}
        </div>
        <time class="time start">{{ dateStart | hour }}</time>
        <time class="time end">{{ dateEnd | hour }}</time>
        <nav>
          <a @click="deleteEvent">Supprimer</a>
          <a @click="editEvent">Modifier</a>
        </nav>
      </div>`,

    props: ['event', 'weekDayRef'],

    data(){
        return {
            selected: false
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
                background: 'rgba(255,255,255,.5)',
                height: (this.pixelEnd - this.pixelStart) + 'px',
                position: "absolute",
                top: this.pixelStart + 'px',
                width: (100 / 7) + "%",
                left: (this.weekDay * 100 / 7) + "%"
            }
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

    mounted(){
        console.log(this, this.dateStart);
    }
};

var Calendar = {

    template: `<div class="calendar">
    <div class="meta">
      {{ currentMonth }}
    </div>

    <header class="line">
      <div class="cell cell-time">{{currentYear}}</div>
      <div class="cell cell-day day day-1">LUN</div>
      <div class="cell cell-day day day-2">MAR</div>
      <div class="cell cell-day day day-3">MER</div>
      <div class="cell cell-day day day-4">JEU</div>
      <div class="cell cell-day day day-5">VEN</div>
      <div class="cell cell-day day day-6">SAM</div>
      <div class="cell cell-day day day-7">DIM</div>
    </header>

    <div class="content line">
      <div class="cell cell-time">
        <div class="unit timeinfo">00:00</div>
        <div class="unit timeinfo">01:00</div>
        <div class="unit timeinfo">02:00</div>
        <div class="unit timeinfo">03:00</div>
        <div class="unit timeinfo">04:00</div>
        <div class="unit timeinfo">05:00</div>
        <div class="unit timeinfo">06:00</div>
        <div class="unit timeinfo">07:00</div>
        <div class="unit timeinfo">08:00</div>
        <div class="unit timeinfo">09:00</div>
        <div class="unit timeinfo">10:00</div>
        <div class="unit timeinfo">11:00</div>
        <div class="unit timeinfo">12:00</div>
        <div class="unit timeinfo">13:00</div>
        <div class="unit timeinfo">14:00</div>
        <div class="unit timeinfo">15:00</div>
        <div class="unit timeinfo">16:00</div>
        <div class="unit timeinfo">17:00</div>
        <div class="unit timeinfo">18:00</div>
        <div class="unit timeinfo">19:00</div>
        <div class="unit timeinfo">20:00</div>
        <div class="unit timeinfo">21:00</div>
        <div class="unit timeinfo">22:00</div>
        <div class="unit timeinfo">23:00</div>
      </div>
      <timeevent v-for="event in events"
          :weekDayRef="currentDay"
          v-if="inCurrentWeek(event)"
          :event="event"
          :key="event.id"></timeevent>
      <div class="cell cell-day day day-1">
        &nbsp;
      </div>
      <div class="cell cell-day day day-2">MAR</div>
      <div class="cell cell-day day day-3">MER</div>
      <div class="cell cell-day day day-4">JEU</div>
      <div class="cell cell-day day day-5">VEN</div>
      <div class="cell cell-day day day-6">SAM</div>
      <div class="cell cell-day day day-7">DIM</div>
    </div>

    <footer class="line">
      FOOTER
    </footer>
    </div>`,

    props: {
        mode: 'week'
    },

    data(){
        return {
            events: [],
            currentDay: moment()
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
        }
    },

    components: {
        'timeevent': TimeEvent
    },

    methods: {
        newEvent(evt){
            console.log("CreateEvent")
            this.events.push(evt)
        },
        inCurrentWeek(event){
            return event.inWeek(this.currentDay.year(), this.currentDay.week());
        }
    },

    mounted(){
        console.log(this, this.$el);
        this.newEvent(new EventDT(1, 'Item A', "2017-03-06T09:00", "2017-03-06T11:00"));
        this.newEvent(new EventDT(4, 'Item D', "2017-03-06T13:30", "2017-03-06T17:45"));
        this.newEvent(new EventDT(2, 'Item B', "2017-03-08T13:00", "2017-03-08T17:00"));
        this.newEvent(new EventDT(3, 'Item C', "2017-03-18T09:00", "2017-03-18T11:00"));
    }
};
