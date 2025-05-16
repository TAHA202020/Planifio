import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import BoardsStore from '../Context/BoardsStore'
export default function Calendar() {
  const events=BoardsStore((state) => state.events);
  return (
    <FullCalendar
      height={"100%"}
      plugins={[ dayGridPlugin ]}
      initialView="dayGridMonth"
       events={Object.values(events).map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date}))}
      dayMaxEventRows={true}
      displayEventTime={true} 
      eventClassNames={"bg-transparent border-0 p-0"}
      eventContent={(eventInfo) => {
        return (
          <div className='m-1 bg-black font-bold p-1 w-full'>
            <h1>{eventInfo.event.title}</h1>
          </div>
        )
      }}

      
    />
  )
}