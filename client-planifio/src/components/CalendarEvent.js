export default function CalendarEvent({ event }) {
    console.log(event);
    return (
        <div className="flex flex-col gap-2 p-2 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
        </div>
    );

}