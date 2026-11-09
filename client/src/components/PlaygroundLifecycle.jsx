import React from 'react';

export default function PlaygroundLifecycle({ order, isBuyer }) {
  // Playground steps
  const steps = [
    { id: 1, title: 'Match Created', desc: 'Buyer paid entry fee' },
    { id: 2, title: 'Host Accepted', desc: 'Host matched the fee' },
    { id: 3, title: 'Voting Phase', desc: 'Declaring results' },
    { id: 4, title: 'Completed', desc: 'Prize awarded' },
  ];

  const getStepLevel = () => {
    if (order.status === 'completed') return 4;
    if (order.status === 'inProgress') {
      const myVote = isBuyer ? order.buyerResult : order.sellerResult;
      const otherVote = isBuyer ? order.sellerResult : order.buyerResult;
      if (myVote || otherVote) return 3; // Someone has voted
      return 2;
    }
    return 1; // pending
  };

  const currentLevel = getStepLevel();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm mb-6 w-full">
      <h3 className="font-display font-bold text-stripe-slate text-lg mb-6">Playground Match Lifecycle</h3>
      
      {/* Stepper UI */}
      <div className="relative flex justify-between max-w-4xl mx-auto">
        <div className="absolute left-0 top-5 w-full h-[2px] bg-slate-200 -z-0"></div>
        <div 
          className="absolute left-0 top-5 h-[2px] bg-amber-500 transition-all duration-500 ease-in-out -z-0"
          style={{ width: `${((currentLevel - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = step.id <= currentLevel;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center group" style={{ width: '25%' }}>
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-colors duration-300
                  ${isActive 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                  }
                `}
              >
                {step.id}
              </div>
              <div className="px-1">
                <p className={`font-bold text-sm ${isActive ? 'text-stripe-slate' : 'text-slate-400'}`}>
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight max-w-[120px] mx-auto hidden sm:block">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
