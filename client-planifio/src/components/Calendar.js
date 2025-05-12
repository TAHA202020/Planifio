import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!

export default function Calendar() {
  return (
    <FullCalendar
      height={"100%"}
      plugins={[ dayGridPlugin ]}
      initialView="dayGridMonth"
       events={[
        { title: 'event 1', date: '2025-05-01' },
        { title: 'event 1', date: '2025-05-01' }
      ]}
      dayMaxEventRows={true}
      displayEventTime={true} 
    />
  )
}