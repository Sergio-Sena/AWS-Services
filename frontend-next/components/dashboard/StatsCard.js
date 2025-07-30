import React from 'react';

export function StatsCard({ icon, title, value, color = 'blue', subtitle = null }) {
  // Mapear cores para classes
  const colorClasses = {
    blue: 'neon-blue bg-blue-500',
    green: 'neon-green bg-green-500',
    purple: 'neon-purple bg-purple-500',
    yellow: 'neon-yellow bg-yellow-500',
    orange: 'neon-orange bg-orange-500'
  };
  
  const iconColorClass = colorClasses[color] || colorClasses.blue;
  const textColorClass = `neon-${color}` || 'neon-blue';
  
  // Truncar valores muito longos
  const displayValue = typeof value === 'string' && value.length > 20 
    ? value.substring(0, 17) + '...' 
    : value;
  
  return (
    <div className="neon-border rounded-xl p-4 hover-lift">
      <div className="flex flex-col items-center">
        <div className={`rounded-full ${iconColorClass} bg-opacity-20 p-3 mb-2`}>
          <i className={`fas fa-${icon} text-2xl ${textColorClass}`}></i>
        </div>
        <div className="text-center">
          <h3 className="text-sm text-slate-300">{title}</h3>
          <p className={`text-xl font-bold ${textColorClass}`} title={value}>{displayValue}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}