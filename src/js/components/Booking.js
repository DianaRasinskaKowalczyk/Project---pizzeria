import { select, settings, templates, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';


class Booking{
  constructor(element){
    const thisBooking = this;

    /* start render - that has reference to the container - element */
    thisBooking.render(element);

    thisBooking.initWidgets();

    thisBooking.getData();

    /* NEW - to keep info about selected table */
    thisBooking.selectedTable = {};
    // console.log(thisBooking.selectedTable);
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
  
      ],
  
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
  
      ],
  
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
  
    };

    // console.log('getData params', params);

    const urls = {
    
      booking: settings.db.url + '/' + settings.db.bookings
          + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events
          + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events
          + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
    
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(const item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(const item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(const item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    console.log(thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] === 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);


    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date] [hourBlock] === 'undefined'){
        thisBooking.booked[date] [hourBlock] = [];
      }
      
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] === 'undefined' 
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    const thisBooking = this;

    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget(element);

    /* create empty DOM element */
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    /* make reference to people and hours inputs + datepicker and hourpicker and tables*/
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    /* NEW make reference to container of tables */
    thisBooking.dom.tablesContainer = thisBooking.dom.wrapper.querySelector(select.booking.allTables);

  } 

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('click', function(){

    }),

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function(){

    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('click', function(){

    });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('click', function(){

    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    /* NEW start initTables when there's a click on tablesContainer */
    thisBooking.dom.tablesContainer.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });
  }

  /* NEW make function initTables */
  initTables(event){
    const thisBooking = this;

    const clickedElement = event.target;

    /* NEW find table id */
    const tableId = clickedElement.getAttribute('data-table');

    /* NEW if a table was clicked */
    if(tableId){

      /* NEW check if it's not booked */
      if(!clickedElement.classList.contains(classNames.booking.tableBooked)){

        /* NEW if it's not booked then this table is a selected table */ 
        thisBooking.selectedTable = tableId;
        console.log('tableId', tableId);

        /* NEW if it's booked - show alert */
      }else{
        alert('Ten stolik jest zajęty');
      }
    }

    /* NEW for every table */
    for(const table of thisBooking.dom.tables){

      /* NEW if it's a clicked table - add class selected - this is the selected table */
      if(table === thisBooking.selectedTable){
        table.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedTable = tableId;

        /* NEW if it's not a selected table - remove class selected */
      } else{
        table.classList.remove(classNames.booking.tableSelected);
        thisBooking.selectedTable = null;
      }

      /* NEW if this table was already selected - remove class selected */
      if(table.classList.contains(classNames.booking.tableSelected)){
        clickedElement.classList.remove(classNames.booking.tableSelected);
        thisBooking.selectedTable = null;
      }
    }
  }

}

export default Booking;