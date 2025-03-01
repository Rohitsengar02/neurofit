import { FaCalendarPlus } from 'react-icons/fa';
import CardWrapper from './CardWrapper';

const UpcomingEvents = () => {
  const events = [
    {
      id: 1,
      title: 'Marathon Training',
      date: 'Next Week',
      type: 'Running',
    },
    {
      id: 2,
      title: 'Yoga Class',
      date: 'Tomorrow',
      type: 'Wellness',
    },
    {
      id: 3,
      title: 'HIIT Session',
      date: 'Friday',
      type: 'Workout',
    },
  ];

  return (
    <CardWrapper title="Upcoming Events" icon={<FaCalendarPlus />}>
      <div className="space-y-3">
        {/* Events List */}
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-blue-50 p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-gray-800">{event.title}</div>
                <div className="text-sm text-blue-600">{event.type}</div>
              </div>
              <div className="text-sm text-gray-600">{event.date}</div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="bg-blue-100 p-2 rounded-lg">
            <div className="text-gray-600">This Week</div>
            <div className="font-semibold text-gray-800">5 Events</div>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg">
            <div className="text-gray-600">Next Week</div>
            <div className="font-semibold text-gray-800">3 Events</div>
          </div>
        </div>

        {/* View All Button */}
        <button className="w-full py-2 px-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
          View All Events
        </button>
      </div>
    </CardWrapper>
  );
};

export default UpcomingEvents;
