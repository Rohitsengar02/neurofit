import { FaChartBar } from 'react-icons/fa';
import CardWrapper from './CardWrapper';

const ActivityBreakdown = () => {
  const activities = [
    { name: 'Walking', percentage: 40, color: 'bg-blue-400' },
    { name: 'Running', percentage: 30, color: 'bg-green-400' },
    { name: 'Cycling', percentage: 30, color: 'bg-purple-400' },
  ];

  const totalMinutes = 180; // 3 hours of activity

  return (
    <CardWrapper title="Activity Types" icon={<FaChartBar />}>
      <div className="space-y-3">
        {/* Activity Distribution */}
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={`h-full ${activity.color} transition-all duration-500`}
              style={{ width: `${activity.percentage}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2">
          {activities.map((activity, index) => (
            <div key={index} className="text-center">
              <div className={`w-3 h-3 ${activity.color} rounded-full mx-auto mb-1`} />
              <div className="text-xs text-gray-600">{activity.name}</div>
              <div className="text-sm font-semibold">{activity.percentage}%</div>
            </div>
          ))}
        </div>

        {/* Total Time */}
        <div className="bg-blue-50 p-2 rounded-lg text-center">
          <div className="text-sm text-gray-600">Total Active Time</div>
          <div className="font-semibold text-gray-800">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="bg-blue-50 p-2 rounded-lg">
            <div className="text-gray-600">Calories</div>
            <div className="font-semibold text-gray-800">850</div>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg">
            <div className="text-gray-600">Distance</div>
            <div className="font-semibold text-gray-800">8.5 km</div>
          </div>
        </div>

        {/* Analyze Button */}
        <button className="w-full py-2 px-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
          Analyze Activity
        </button>
      </div>
    </CardWrapper>
  );
};

export default ActivityBreakdown;
