import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function FestivalCalendar({ festivals }) {
  const events = festivals.map(festival => ({
    id: festival.id,
    title: festival.name,
    start: new Date(festival.start_date),
    end: new Date(festival.end_date),
    resource: festival,
    className: festival.region
  }));

  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource.region === 'tirol' ? '#e74c3c' : '#2ecc71';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        messages={{
          next: "Nächster",
          previous: "Vorheriger",
          today: "Heute",
          month: "Monat",
          week: "Woche",
          day: "Tag",
          agenda: "Agenda",
          date: "Datum",
          time: "Zeit",
          event: "Veranstaltung",
          noEventsInRange: "Keine Veranstaltungen in diesem Zeitraum."
        }}
      />
    </div>
  );
}

export default FestivalCalendar;
