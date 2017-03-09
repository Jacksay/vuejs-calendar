import moment from "moment";

class EventDT {
  constructor(id, label, start, end){
    this.id = id;

    // From ICS format
    this.uid = null;

    // ICS : summary
    this.label = label;

    // ICS : description
    this.description = "Description par défaut pour les tests";

    this.start = start;
    this.end = end;
  }

  get mmStart(){
    return moment(this.start)
  }

  get mmEnd(){
    return moment(this.end)
  }

  /**
   * Test si l'événement est présent dans la semaine.
   * @return boolean
   */
  inWeek(year, week){
    let mmStart = this.mmStart.unix(),
        mmEnd = this.mmEnd.unix();

    // Récupération de la plage de la semaine
    let weekStart = moment().year(year).week(week).startOf('week'),
      plageStart = weekStart.unix(),
      plageFin = weekStart.endOf('week').unix();

    if( mmStart > plageFin || mmEnd < plageStart )
          return false

    return mmStart < plageFin || mmEnd > plageStart;
  }
}
