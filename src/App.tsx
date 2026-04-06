import { useState, useMemo } from 'react';
import type {
  SimulationParams,
  OptimizationConstraints,
  OptimizationResult,
  SensitivityResult,
  DailySchedule,
} from './types';
import { DEFAULT_PARAMS, DEFAULT_CONSTRAINTS } from './types';
import type { CostParams } from './lib/optimizer';
import { optimizeDaily, optimizeStaffing, runSensitivityAnalysis } from './lib/optimizer';
import { getDemandProfile, type DayName } from './lib/dataset';
import InputPanel, { type DaySelection } from './components/InputPanel';
import DemandProfileChart from './components/DemandProfileChart';
import StaffingScheduleView from './components/StaffingScheduleView';
import ResultsDashboard from './components/ResultsDashboard';
import Charts from './components/Charts';

const DEFAULT_COST: CostParams = {
  laborCostPerHour: 18,
  revenuePerWalkIn: 5.5,
  revenuePerMobile: 4.5,
  abandonmentThreshold: 8,
  penaltyCostPerAbandonment: 3,
  waitPenaltyPerMinute: 0.15,
};

export default function App() {
  const [selectedDay, setSelectedDay] = useState<DaySelection>('Average');
  const [cost, setCost] = useState<CostParams>(DEFAULT_COST);
  const [constraints, setConstraints] =
    useState<OptimizationConstraints>(DEFAULT_CONSTRAINTS);
  const [customParams, setCustomParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [isRunning, setIsRunning] = useState(false);

  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityResult | null>(null);

  const isCustom = selectedDay === 'Custom';
  const demand = useMemo(
    () => (isCustom ? null : getDemandProfile(selectedDay as DayName | 'Average')),
    [selectedDay, isCustom],
  );

  const clearResults = () => {
    setSchedule(null);
    setOptimization(null);
    setSensitivity(null);
  };

  const handleOptimize = () => {
    setIsRunning(true);
    clearResults();

    setTimeout(() => {
      if (isCustom) {
        const params: SimulationParams = { ...customParams, ...cost };
        const opt = optimizeStaffing(params, constraints, 1, 10, 10);
        setOptimization(opt);
        const sens = runSensitivityAnalysis(params);
        setSensitivity(sens);
      } else {
        const result = optimizeDaily(
          selectedDay,
          demand!,
          cost,
          constraints,
        );
        setSchedule(result);
      }
      setIsRunning(false);
    }, 20);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header */}
      <header className="bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-screen-2xl mx-auto px-6 py-3.5 flex items-center gap-4">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <span className="text-sm leading-none text-neutral-900">&#9749;</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white">
              Staffing Optimizer
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium tracking-wide">
              M/M/s queue &middot; priority scheduling &middot; abandonment model
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-80 xl:w-[22rem] flex-shrink-0 border-r border-neutral-200 bg-neutral-950 overflow-y-auto p-5">
          <InputPanel
            selectedDay={selectedDay}
            onDayChange={(d) => {
              setSelectedDay(d);
              clearResults();
            }}
            demand={demand}
            customParams={customParams}
            onCustomParamsChange={setCustomParams}
            cost={cost}
            onCostChange={setCost}
            constraints={constraints}
            onConstraintsChange={setConstraints}
            onOptimize={handleOptimize}
            isRunning={isRunning}
          />
          {!isCustom && demand && (
            <DemandProfileChart demand={demand} day={selectedDay} />
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-neutral-100">
          {!isCustom && schedule && (
            <StaffingScheduleView schedule={schedule} laborCostPerHour={cost.laborCostPerHour} />
          )}

          {isCustom && optimization && (
            <>
              <ResultsDashboard
                results={optimization.optimalResult}
                optimization={optimization}
                constraints={constraints}
              />
              <Charts optimization={optimization} sensitivity={sensitivity} />
            </>
          )}

          {!schedule && !optimization && (
            <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-white p-16 text-center">
              <div className="w-10 h-10 rounded-full bg-neutral-100 mx-auto mb-4 flex items-center justify-center">
                <span className="text-neutral-400 text-lg">&#9749;</span>
              </div>
              <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
                {isCustom ? (
                  <>
                    Enter demand parameters, then click{' '}
                    <span className="text-neutral-900 font-medium">Optimize Staffing</span> to
                    find the optimal number of baristas.
                  </>
                ) : (
                  <>
                    Select a day and configure costs, then click{' '}
                    <span className="text-neutral-900 font-medium">Optimize Daily Schedule</span> to
                    generate per-hour staffing recommendations.
                  </>
                )}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
