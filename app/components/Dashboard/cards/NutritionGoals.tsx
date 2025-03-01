import { FaAppleAlt } from 'react-icons/fa';
import CardWrapper from './CardWrapper';

const NutritionGoals = () => {
  const nutritionData = {
    protein: {
      current: 80,
      goal: 120,
    },
    fats: {
      current: 45,
      goal: 60,
    },
    carbs: {
      current: 180,
      goal: 200,
    },
  };

  const calculateProgress = (current: number, goal: number) => {
    return (current / goal) * 100;
  };

  return (
    <CardWrapper title="Nutrition Goals" icon={<FaAppleAlt />}>
      <div className="space-y-3">
        {/* Protein Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Protein</span>
            <span className="text-gray-800 font-medium">
              {nutritionData.protein.current}g / {nutritionData.protein.goal}g
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{
                width: `${calculateProgress(
                  nutritionData.protein.current,
                  nutritionData.protein.goal
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Fats Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fats</span>
            <span className="text-gray-800 font-medium">
              {nutritionData.fats.current}g / {nutritionData.fats.goal}g
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${calculateProgress(
                  nutritionData.fats.current,
                  nutritionData.fats.goal
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Carbs Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Carbs</span>
            <span className="text-gray-800 font-medium">
              {nutritionData.carbs.current}g / {nutritionData.carbs.goal}g
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full transition-all duration-500"
              style={{
                width: `${calculateProgress(
                  nutritionData.carbs.current,
                  nutritionData.carbs.goal
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Daily Summary */}
        <div className="bg-blue-50 p-2 rounded-lg text-center text-sm">
          <div className="text-gray-600">Daily Target</div>
          <div className="font-semibold text-gray-800">1,800 calories</div>
        </div>

        {/* Set Goals Button */}
        <button className="w-full py-2 px-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
          Set Goals
        </button>
      </div>
    </CardWrapper>
  );
};

export default NutritionGoals;
