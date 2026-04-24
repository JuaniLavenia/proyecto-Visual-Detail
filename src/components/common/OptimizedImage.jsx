import { useState, useEffect, useRef } from 'react';
import { Image } from './Icons';

/**
 * Componente OptimizedImage - Imagen con lazy loading y placeholders
 * 
 * Características:
 * - Lazy loading nativo del navegador
 * - Placeholder mientras carga (esqueleto o color)
 * - Blur-up progresivo
 * - Error handling con fallback
 * - onLoad callback
 * 
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} className - Clases CSS adicionales
 * @param {object} ...props - Props adicionales para img
 */

export function OptimizedImage({
  src,
  alt = '',
  className = '',
  placeholderClassName = '',
  blurDataURL = null, // Para blur-up progresivo (opcional)
  showPlaceholder = true,
  onLoad,
  onError,
  ...imgProps
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Cargar 50px antes de que sea visible
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Placeholder de esqueleto
  const SkeletonPlaceholder = () => (
    <div 
      className={`animate-pulse bg-gray-700 ${placeholderClassName}`}
      aria-hidden="true"
    >
      {/* Efecto de shimmer */}
      <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer" />
    </div>
  );

  // Fallback para error
  const ErrorPlaceholder = () => (
    <div 
      className={`flex items-center justify-center bg-gray-800 ${placeholderClassName}`}
      aria-hidden="true"
    >
      <Image className="w-12 h-12 text-gray-600" />
    </div>
  );

  // No renderizar nada si no hay src
  if (!src) {
    return showPlaceholder ? <SkeletonPlaceholder /> : null;
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder - mostrar solo si está cargando y hay showPlaceholder */}
      {isLoading && showPlaceholder && !hasError && (
        <SkeletonPlaceholder />
      )}

      {/* Error fallback */}
      {hasError && (
        <ErrorPlaceholder />
      )}

      {/* Imagen real - solo cargar si está en viewport o ya sescrolló */}
      {(!isLoading || hasError) && !hasError && isInView && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={`
            ${className}
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            transition-opacity duration-300
          `}
          {...imgProps}
        />
      )}
    </div>
  );
}

/**
 * ImageWithFallback - Imagen con fallback automático
 * Intenta cargar imagen optimizada primero, luego fallback
 * 
 * @param {string} src - URL principal
 * @param {string} fallbackSrc - URL de fallback
 * @param {string} alt - Texto alternativo
 */

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt = '',
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  const handleError = () => {
    if (!hasTriedFallback && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
    }
  };

  return (
    <OptimizedImage
      src={currentSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}

/**
 * AvatarImage - Imagen específicamente para-avatares
 * Incluye shape circular y manejo de errores
 */

export function AvatarImage({
  src,
  alt = 'Avatar',
  size = 'md',
  fallBackName = '',
  ...props
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const sizeClass = sizes[size] || sizes.md;

  // Generate initials para fallback visual
  const initials = fallBackName
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0`}>
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          placeholderClassName="w-full h-full"
          {...props}
        />
      ) : (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
          <span className="text-white/70 text-sm font-medium">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * ProductImage - Componente especializado para imágenes de productos
 * con soporte para rutas de API y CDN
 */

export function ProductImage({
  image,
  productName = '',
  size = 'default', // 'thumbnail', 'small', 'default', 'large'
  apiBase = '',
  ...props
}) {
  const [imageError, setImageError] = useState(false);

  // Convertir ruta relativa a URL completa
  const imageUrl = (() => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    if (apiBase) return `${apiBase}/img/productos/${image}`;
    // Asumir que ya es ruta relativa
    return `/img/productos/${image}`;
  })();

  const handleError = () => {
    setImageError(true);
  };

  // Tamaño según el tipo
  const sizeClasses = {
    thumbnail: 'w-16 h-16',
    small: 'w-20 h-20',
    default: 'w-full h-full',
    large: 'w-full h-full',
  };

  if (imageError || !imageUrl) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gray-800 rounded-lg`}>
        <Package className="w-8 h-8 text-gray-600" />
      </div>
    );
  }

  return (
    <OptimizedImage
      src={imageUrl}
      alt={productName}
      onError={handleError}
      className={sizeClasses[size]}
      placeholderClassName={sizeClasses[size]}
      {...props}
    />
  );
}

// Re-export Image para compatibility
export { Image as Package };

export default OptimizedImage;