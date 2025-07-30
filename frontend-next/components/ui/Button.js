import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  onClick, 
  disabled = false, 
  fullWidth = false,
  className = '',
  tooltip = ''
}) {
  // Definir classes com base na variante
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    neon: 'neon-button'
  };
  
  const baseClasses = 'font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center';
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'hover-lift click-effect';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClasses} ${className}`}
      data-tooltip={disabled && tooltip ? tooltip : ''}
    >
      {children}
      {disabled && tooltip && <i className="fas fa-lock ml-2 delete-lock-icon"></i>}
    </button>
  );
}