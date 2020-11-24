/*
  Author: Savoir-faire Linux
  Contributor: Gharib Larbi "larbi.gharib@savoirfairelinux.com"
  Version: 2.0
  Description: This calendar is used to fecth data from the api 
  endpoint for calendar events in an Odoo instance.
  Dependencies: {
    fullcalendar-4.3.1,
    project_resource_calendar_api
  }

  TODO: Use eventSource to avoid removing events from the cache on week day month change

*/


var url = 'https://gesteve.umontreal.ca/api/calendar/events/';
var rooms_colors = [];
function getRoomColor(room_name) {
  let color = "";
  rooms_colors.forEach(function (room) {
    if (room.name == room_name) {
      color = room.color;
      return;
    }
  })
  return color;
}

let source = [];

let currentDate = null;

let lower_interval = 3;
let higher_interval = 3;
let period_delta = 7;

function loadDataFromServer(calendar, url, room) {
  var start_date = new Date(currentDate);
  start_date.setDate(start_date.getDate() - lower_interval);
  var end_date = new Date(currentDate);
  end_date.setDate(end_date.getDate() + higher_interval);
  var data = {
    'start_date': start_date.toISOString().substring(0, 10),
    'end_date': end_date.toISOString().substring(0, 10),
    'room': room,
  }
  $.ajax({
    dataType: 'json',
    url: url,
    data: data,
    success: function (response) {
      let events = response.results.message;
      if(response.results.code !== 500){
        events.forEach(function (event) {
          event['backgroundColor'] = getRoomColor(event.room_name);
          calendar.addEvent(event);
        });
      }
    },
    error: function (xhr) {
      console.log("Error");
    }
  });
}




document.addEventListener('DOMContentLoaded', function () {

  /**
    Set calendar
  **/


  var calendarEl = document.getElementById('calendar');

  let defaultView = 'timeGridWeek';
  let header = {
    left: 'prev,next, today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  }
  

  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    defaultView = 'timeGridDay';
    header = {
      left: '',
      center: 'prev, today,dayGridMonth,timeGridWeek,timeGridDay, next',
      right: ''
    }
  }

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ['timeGrid', 'dayGrid'],
    defaultView: defaultView,
    header: header,
    businessHours: {
      // days of week. an array of zero-based day of week integers (0=Sunday)
      daysOfWeek: [1, 2, 3, 4], // Monday - Thursday
      startTime: '10:00', // a start time (10am in this example)
      endTime: '18:00', // an end time (6pm in this example)
    },
    locale: 'fr'
  });

  calendar.render();

  calendar.setOption('height', 700);

  Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('-');
  };

  var todayDate = calendar.getDate();
  $("#month-name h3").text(todayDate.yyyymmdd());
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    // $('.fc-today-button').html('<span class="material-icons">bookmark_border</span>');
    // $('.fc-dayGridMonth-button').html('<span class="material-icons">view_module</span >');
    // $('.fc-timeGridWeek-button').html('<span class="material-icons">view_column</span >');
    // $('.fc-timeGridDay-button').html('<span class="material-icons">aspect_ratio</span>');
    // //$('.fc-today-button').html('A');
    // $('.fc-dayGridMonth-button').html('M');
    // $('.fc-timeGridWeek-button').html('S');
    // $('.fc-timeGridDay-button').html('J');
  }



  /*
    Set initial interval values
  */

  function setIntervals(period) {
    let refDate = new Date(currentDate);
    if(period === "month") {
      lower_interval = refDate.getDate();
      higher_interval = 31 - refDate.getDate();
      period_delta = 15;
    }
    else if (period === "week"){
      lower_interval = refDate.getDay() + 1;
      higher_interval = 8 - refDate.getDay();
      period_delta = 7;
    }
    else {
      lower_interval = 1;
      higher_interval = 1;
      period_delta = 1;
    }
    
  }

  setIntervals("week");


  $(".fc-dayGridMonth-button").on('click', function () {
    setIntervals("month");
    calendar.getEvents().forEach(function (event) {
      event.remove();
    });
    $('#roomFilter')[0].childNodes.forEach(function (item) {
      if (item.childNodes[0].checked == true) {
        loadDataFromServer(calendar, url, item.childNodes[0].name);
      }
    });
  })
  $(".fc-timeGridWeek-button").on('click', function () {
    setIntervals("week");
    console.log(lower_interval)
    console.log(higher_interval)
    console.log(period_delta)
    calendar.getEvents().forEach(function (event) {
      event.remove();
    });
    $('#roomFilter')[0].childNodes.forEach(function (item) {
      if (item.childNodes[0].checked == true) {
        loadDataFromServer(calendar, url, item.childNodes[0].name);
      }
    });
  })
  $(".fc-timeGridDay-button").on('click', function () {
    setIntervals("day");
    calendar.getEvents().forEach(function (event) {
      event.remove();
    });
    $('#roomFilter')[0].childNodes.forEach(function (item) {
      if (item.childNodes[0].checked == true) {
        loadDataFromServer(calendar, url, item.childNodes[0].name);
      }
    });
  })

  /*
    Get rooms from file and build filter
  */
  var rooms = [];

  $.getJSON("rooms.json", function (data) {
    rooms_colors = data;
    data.forEach(function (room) {
      rooms.push(room.name);
      //build filter
      $('#roomFilter').append('<div style="background-color: ' + room.color + '"><input class="checkbox" type="checkbox" name="' + room.name + '" value="' + room.name + '" checked>' + room.name + '</input></div>');
    });
  }).then(function () {


    currentDate = new Date(calendar.getDate());

    rooms.forEach(function (room) {
      loadDataFromServer(calendar, url, room);
    });

    /*
      Set list of rooms
    */
    $('.checkbox').on('click', function () {
      //loadDataFromServer();
      name = this.name;
      if (this.checked) {
        loadDataFromServer(calendar, url, name);
      }
      else {
        calendar.getEvents().forEach(function (event) {
          if (event._def.extendedProps['room_name'] == name) {
            event.remove();
          }
        });
      }
    });

  });

  /*
    Navigation prev next today update events
  */

  $('.fc-prev-button').on('click', function () {
    calendar.getEvents().forEach(function (event) {
      event.remove();
    });
    currentDate.setDate(currentDate.getDate() - period_delta);
    $('#roomFilter')[0].childNodes.forEach(function (item) {
      if (item.childNodes[0].checked == true) {
        loadDataFromServer(calendar, url, item.childNodes[0].name);
      }
    });
  });

  $('.fc-next-button').on('click', function () {
    calendar.getEvents().forEach(function (event) {
      event.remove();
    });
    currentDate.setDate(currentDate.getDate() + period_delta);
    $('#roomFilter')[0].childNodes.forEach(function (item) {
      if (item.childNodes[0].checked == true) {
        loadDataFromServer(calendar, url, item.childNodes[0].name);
      }
    });
  });

  $('.fc-today-button').on('click', function () {
    calendar.getEvents().forEach(function (event) {
      event.remove();
    });
    currentDate = new Date(calendar.getDate())
    $('#roomFilter')[0].childNodes.forEach(function (item) {
      if (item.childNodes[0].checked == true) {
        loadDataFromServer(calendar, url, item.childNodes[0].name);
      }
    });
    todayDate = calendar.getDate();
    $("#month-name h3").text(todayDate.yyyymmdd());
  });


  /*
    Datepicker navigation go to date
  */

  $(function () {
    $("#datepicker").datepicker({
      onSelect: function (date) {
        calendar.gotoDate(date);
        currentDate = new Date(date);
        calendar.getEvents().forEach(function (event) {
          event.remove();
        });
        $('#roomFilter')[0].childNodes.forEach(function (item) {
          if (item.childNodes[0].checked == true) {
            loadDataFromServer(calendar, url, item.childNodes[0].name);
          }
        });
        $("#month-name h3").text(date);
      },
      dateFormat: 'yy-mm-dd',
    });

  });
  $.datepicker.regional['fr'] = {
    clearText: 'Effacer', clearStatus: '',
    closeText: 'Fermer', closeStatus: 'Fermer sans modifier',
    prevText: '&lt;Préc', prevStatus: 'Voir le mois précédent',
    nextText: 'Suiv&gt;', nextStatus: 'Voir le mois suivant',
    currentText: 'Courant', currentStatus: 'Voir le mois courant',
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    monthStatus: 'Voir un autre mois', yearStatus: 'Voir un autre année',
    weekHeader: 'Sm', weekStatus: '',
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    dayStatus: 'Utiliser DD comme premier jour de la semaine', dateStatus: 'Choisir le DD, MM d',
    //dateFormat: 'dd/mm/yy', 
    firstDay: 0,
    initStatus: 'Choisir la date', isRTL: false
  };
  $.datepicker.setDefaults($.datepicker.regional['fr']);

});




