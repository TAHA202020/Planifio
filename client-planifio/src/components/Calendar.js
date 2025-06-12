import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import BoardsStore from '../Context/BoardsStore'
import { Link } from 'react-router-dom';
import SmartMarquee from './SmartMarquee';
export default function Calendar() {
  const events=BoardsStore((state) => state.events);
  document.title = "Planifio - Calendar";
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
      const event = events[eventInfo.event._def.publicId];
      return (
        <Link
          to={`/dashboard/${event.boardId}`}
          className="p-1 w-full flex items-center"
        >
          <SmartMarquee className="text-ellipsis">
            <span className="font-medium">
              {eventInfo.timeText.toUpperCase() + "M "}{eventInfo.event.title}
            </span>
            <span className="badge badge-flat-success ml-1">
              {event.listTitle}
            </span>
          </SmartMarquee>
        </Link>
      );
    }}

      
    />
  )
}