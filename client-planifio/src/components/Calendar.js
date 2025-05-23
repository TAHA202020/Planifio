import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import BoardsStore from '../Context/BoardsStore'
import { Link } from 'react-router-dom';
export default function Calendar() {
  const events=BoardsStore((state) => state.events);
  return (
    <FullCalendar
      height={"100%"}
      headerToolbar={{left: 'prev today', center: 'title', right: 'next'}}
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
        console.log(eventInfo);
        return (
          <Link to={`/dashboard/${events[eventInfo.event._def.publicId].boardId}`} className='font-bold p-1 w-full overflow-hidden text-ellipsis whitespace-nowrap flex'>
            <div  className='font-medium'>{eventInfo.timeText.toUpperCase()+'M '}{eventInfo.event.title}</div>
            <span className='badge badge-flat-success ml-1'>{events[eventInfo.event._def.publicId].listTitle}</span>
          </Link>
        )
      }}

      
    />
  )
}