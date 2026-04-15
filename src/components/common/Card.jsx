import PropTypes from 'prop-types';

/**
 * Card - Componente de tarjeta reutilizable
 * @param {string} variant - 'default' | 'elevated' | 'outlined'
 * @param {node} children - Contenido
 * @param {string} className - Clases adicionales
 */
export default function Card({ variant = 'default', children, className = '', ...props }) {
  const variantClasses = {
    default: 'bg-white rounded-lg shadow-sm',
    elevated: 'bg-white rounded-lg shadow-lg',
    outlined: 'bg-white rounded-lg border border-gray-200',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Subcomponentes
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
};