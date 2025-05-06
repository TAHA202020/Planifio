import {MonthlyCalendar ,MonthlyNav ,MonthlyBody ,MonthlyDay} from "@zach.codes/react-calendar"
import CalendarEvent from "./CalendarEvent"
import { startOfMonth } from "date-fns";
import { useState } from "react";



export default function Calendar()
{
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(Date.now()));
    return (
        <div className="calendar">
<MonthlyCalendar
  currentMonth={currentMonth}
  onCurrentMonthChange={(newMonth)=>{
    setCurrentMonth(startOfMonth(newMonth));
  }}
>
  <MonthlyNav />
  <MonthlyBody style={{backgroundColor: 'black'}}
    events={[
      {
        date: new Date('2025-05-02T20:14:06.089Z'),
        title: 'Call John'
      },
      {
        date: new Date('2025-05-02T20:14:06.089Z'),
        title: 'Call John'
      },
      {
        date: new Date('2025-05-02T21:14:06.089Z'),
        title: 'Call John'
      },
      {
        date: new Date('2025-05-02T22:14:06.089Z'),
        title: 'Meeting with Bob'
      },
      {
        date: new Date('2025-06-02T22:14:06.089Z'),
        title: 'Meeting with Bob'
      }
    ]}
  >
    <MonthlyDay renderDay={(dayevents)=>{
        return dayevents.map(((event,index)=>{
            return <CalendarEvent event={event}/>
        }))
    }}/>

  </MonthlyBody>
</MonthlyCalendar>
</div>)
}