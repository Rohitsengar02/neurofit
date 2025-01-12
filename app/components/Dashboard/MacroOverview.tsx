"use client";

import React, { useState } from 'react';

const MacroOverview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const updateTooltip = (text: string) => {
    const tooltip = document.getElementById('macro-tooltip');
    if (tooltip) {
      tooltip.innerHTML = text;
    }
  };

  return (
    <div className="lg:col-span-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] dark:shadow-[0_20px_50px_rgba(0,_0,_0,_0.3)] p-4 sm:p-4 mx-[-12px] sm:mx-0 px-3 sm:px-4 mb-4 lg:mb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Macros Overview</h2>
          <select 
            className="text-sm text-gray-500 dark:text-gray-400 bg-transparent border-none outline-none cursor-pointer"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="block sm:flex sm:items-start sm:space-x-6">
          {/* Single Multi-colored Progress Circle */}
          <div className="relative w-36 h-36 flex-shrink-0 mx-auto sm:mx-0 mb-8 sm:mb-0">
            {/* Background Circle */}
            <svg className="w-full h-full">
              <circle
                className="text-gray-100 dark:text-zinc-800"
                strokeWidth="9"
                stroke="currentColor"
                fill="transparent"
                r="66"
                cx="72"
                cy="72"
              />
            </svg>
            
            {/* Carbs Progress - Outer */}
            <div 
              className="macro-ring-hover group cursor-pointer"
              onClick={() => updateTooltip(`
                <div class="text-lg">
                  <span class="text-green-500 font-semibold">45%</span>
                  <span class="text-xs text-gray-500 ml-1">Carbs</span>
                </div>
              `)}
            >
              <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90">
                <circle
                  className="text-green-500 transition-all duration-200"
                  strokeWidth="9"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="66"
                  cx="72"
                  cy="72"
                  strokeDasharray={`${0.28 * 2 * Math.PI * 66} ${2 * Math.PI * 66}`}
                  transform="rotate(0 72 72)"
                />
              </svg>
            </div>

            {/* Protein Progress - Middle */}
            <div 
              className="macro-ring-hover group cursor-pointer"
              onClick={() => updateTooltip(`
                <div class="text-lg">
                  <span class="text-blue-500 font-semibold">35%</span>
                  <span class="text-xs text-gray-500 ml-1">Protein</span>
                </div>
              `)}
            >
              <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90">
                <circle
                  className="text-blue-500 transition-all duration-200"
                  strokeWidth="9"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="66"
                  cx="72"
                  cy="72"
                  strokeDasharray={`${0.28 * 2 * Math.PI * 66} ${2 * Math.PI * 66}`}
                  transform="rotate(120 72 72)"
                />
              </svg>
            </div>

            {/* Fats Progress - Inner */}
            <div 
              className="macro-ring-hover group cursor-pointer"
              onClick={() => updateTooltip(`
                <div class="text-lg">
                  <span class="text-purple-500 font-semibold">25%</span>
                  <span class="text-xs text-gray-500 ml-1">Fats</span>
                </div>
              `)}
            >
              <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90">
                <circle
                  className="text-purple-500 transition-all duration-200"
                  strokeWidth="9"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="66"
                  cx="72"
                  cy="72"
                  strokeDasharray={`${0.28 * 2 * Math.PI * 66} ${2 * Math.PI * 66}`}
                  transform="rotate(240 72 72)"
                />
              </svg>
            </div>

            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div id="macro-tooltip">
                <div className="text-lg">
                  <span className="text-gray-900 dark:text-white font-semibold">2,100</span>
                  <div className="text-xs text-gray-500">calories</div>
                </div>
              </div>
            </div>
          </div>

          {/* Macros List */}
          <div className="flex-grow">
            <div className="grid grid-cols-3 sm:grid-cols-1 gap-4 sm:gap-0">
              {/* Carbs Section */}
              <div className="sm:mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Carbs</span>
                </div>
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>180g</span>
                    <span>250g</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                    <div className="h-1.5 bg-green-500 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>

              {/* Protein Section */}
              <div className="sm:mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Protein</span>
                </div>
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>140g</span>
                    <span>180g</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: '77%' }}></div>
                  </div>
                </div>
              </div>

              {/* Fats Section */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500"></div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Fats</span>
                </div>
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>80g</span>
                    <span>100g</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                    <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroOverview;
