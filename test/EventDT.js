var assert = require('assert'),
    EventDT = require('../build/js/EventDT.js')
    ;

describe('Test EventDT instance', ()=>{
    it('Methods inWeek(year, week), single day event', ()=>{
      var e = new EventDT(1,'Item1','2017-01-03', '2017-01-03');
      assert.equal(e.inWeek(2017, 1), true)

      e = new EventDT(1,'Item1','2017-01-07', '2017-01-07');
      assert.equal(e.inWeek(2017, 1), true)

      e = new EventDT(1,'Item1','2017-01-08', '2017-01-08');
      assert.equal(e.inWeek(2017, 2), true)

      e = new EventDT(1,'Item1','2017-01-01', '2017-01-01');
      assert.equal(e.inWeek(2017, 1), true)
    })

    it('Methods inWeek(year, week), Start before, end after', ()=>{
      var e = new EventDT(1,'Item1','2016-12-15', '2017-01-15');
      assert.equal(e.inWeek(2017, 1), true, "Mi décembre à Mi Janvier")
    })

    it('Methods inWeek(year, week), Start before, end inside', ()=>{
      var e = new EventDT(1,'Item1','2016-12-15', '2017-01-03');
      assert.equal(e.inWeek(2017, 1), true, "Mi décembre à Mi semaine")
    })

    it('Methods inWeek(year, week), Start inside, end after', ()=>{
      var e = new EventDT(1,'Item1','2017-01-03', '2017-03-03');
      assert.equal(e.inWeek(2017, 1), true, "Mi décembre à Mi semaine")
    })

    it('Methods inWeek(year, week), Start inside, end inside', ()=>{
      var e = new EventDT(1,'Item1','2017-01-03', '2017-01-03');
      assert.equal(e.inWeek(2017, 1), true, "Dedans")
    })

    it('Methods inWeek(year, week), Outside before', ()=>{
      var e = new EventDT(1,'Item1','2016-01-03', '2016-01-03');
      assert.equal(e.inWeek(2017, 1), false, "avant")
    })

    it('Methods inWeek(year, week), Outside after', ()=>{
      var e = new EventDT(1,'Item1','2017-01-15', '2017-01-15');
      assert.equal(e.inWeek(2017, 1), false, "après")
    })
});
