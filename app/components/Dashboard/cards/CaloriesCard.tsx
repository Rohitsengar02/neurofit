import { FaFire } from 'react-icons/fa';
import CardWrapper from './CardWrapper';

const CaloriesCard = () => {
  const calories = {
    burned: 1200,
    consumed: 1800,
    goal: 2000,
  };

  return (
    <CardWrapper title="Calories" icon={<FaFire />}>
      <div className="space-y-3">
        {/* Calories Bar Chart */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="h-24 w-12 bg-gray-100 rounded-t-lg relative">
                <div 
                  className="absolute bottom-0 w-full bg-green-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(calories.burned / calories.goal) * 100}%` }}
                />
              </div>
              <div className="text-xs text-center text-gray-600">Burned</div>
              <div className="text-sm font-semibold text-center">{calories.burned}</div>
            </div>
            
            <div className="space-y-1">
              <div className="h-24 w-12 bg-gray-100 rounded-t-lg relative">
                <div 
                  className="absolute bottom-0 w-full bg-blue-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(calories.consumed / calories.goal) * 100}%` }}
                />
              </div>
              <div className="text-xs text-center text-gray-600">Consumed</div>
              <div className="text-sm font-semibold text-center">{calories.consumed}</div>
            </div>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="text-center text-sm text-gray-600">
          Daily Goal: {calories.goal} cal
        </div>

        {/* Track Button */}
        <button className="w-full py-2 px-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
          Track Calories
        </button>
      </div>
    </CardWrapper>
  );
};

export default CaloriesCard;
