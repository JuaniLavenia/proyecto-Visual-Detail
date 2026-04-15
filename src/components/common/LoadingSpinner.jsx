import PropTypes from 'prop-types';

/**
 * LoadingSpinner - Componente reutilizable de loading
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} color - Color del spinner (tailwind)
 * @param {string} text - Texto opcional debajo del spinner
 */
export default function LoadingSpinner({ size = 'md', color = 'text-blue-600', text }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${color} 
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
        role="status"
        aria-label="Cargando"
      />
      {text && (
        <span className="text-sm text-gray-500">{text}</span>
      )}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.string,
  text: PropTypes.string,
};