import { useState, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';

/**
 * VirtualTable - Tabla con virtual scrolling para mejor rendimiento
 * con muchas filas
 * 
 * @param {Array} data - Array de objetos a mostrar
 * @param {Array} columns - Array de columnas { key, title, width, render }
 * @param {function} onRowClick - Handler al hacer click en fila
 * @param {string} height - Altura total de la tabla
 * @param {number} itemSize - Altura de cada fila (default: 52)
 */

export function VirtualTable({
  data = [],
  columns = [],
  onRowClick,
  height = 400,
  itemSize = 52,
  rowClassName = '',
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  className = '',
}) {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(height);

  // Auto-calcular altura del contenedor
  useEffect(() => {
    if (containerRef.current && height === 'auto') {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerHeight(rect.height || 400);
    }
  }, [height]);

  // Renderizar una fila
  const Row = useCallback(({ index, style }) => {
    const row = data[index];
    const isClickable = !!onRowClick;

    return (
      <div
        style={style}
        className={`
          flex items-center border-b border-white/5
          ${isClickable ? 'cursor-pointer hover:bg-white/5' : ''}
          ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}
          ${rowClassName}
        `}
        onClick={() => onRowClick?.(row, index)}
      >
        {columns.map((col, colIndex) => (
          <div
            key={col.key || colIndex}
            className="flex-shrink-0 px-3"
            style={{
              width: col.width || 'auto',
              flex: col.flex ? 1 : undefined,
              minWidth: col.minWidth,
              maxWidth: col.maxWidth,
              textAlign: col.align || 'left',
            }}
          >
            {col.render ? col.render(row[col.key], row) : row[col.key]}
          </div>
        ))}
      </div>
    );
  }, [data, columns, onRowClick, rowClassName]);

  // Header fijo
  const Header = () => (
    <div className="flex items-center bg-gray-800 border-b border-white/10 font-semibold text-white">
      {columns.map((col, index) => (
        <div
          key={col.key || index}
          className="flex-shrink-0 px-3 py-2"
          style={{
            width: col.width || 'auto',
            flex: col.flex ? 1 : undefined,
            minWidth: col.minWidth,
          }}
        >
          {col.title}
        </div>
      ))}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div 
        ref={containerRef}
        className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}
        style={{ height }}
      >
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-white/50">Cargando...</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data.length) {
    return (
      <div 
        ref={containerRef}
        className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}
        style={{ height }}
      >
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-white/50">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}
    >
      <Header />
      <div style={{ height: containerHeight - 52 }}>
        <List
          height={containerHeight - 52}
          itemCount={data.length}
          itemSize={itemSize}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}

/**
 * VirtualList - Lista virtual simple (para favoritos, resultados, etc.)
 */

export function VirtualList({
  items = [],
  renderItem,
  height = 400,
  itemSize = 80,
  loading = false,
  emptyMessage = 'No hay elementos',
  className = '',
}) {
  const Row = useCallback(({ index, style }) => (
    <div style={style} className="px-4 py-2 border-b border-white/5">
      {renderItem(items[index], index)}
    </div>
  ), [items, renderItem]);

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-white/50">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-white/50">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemSize}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}

/**
 * InfiniteScroll - Componente para cargar más datos al hacer scroll
 */

export function InfiniteScroll({
  children,
  loadMore,
  hasMore = false,
  isLoading = false,
  threshold = 200, // px antes del final para empezar a cargar
  height = 'auto',
  className = '',
}) {
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !loadMore || !hasMore) return;

    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading) {
        loadMore();
      }
    }, options);

    observerRef.current.observe(containerRef.current);

    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, isLoading, threshold]);

  return (
    <div ref={containerRef} className={className}>
      {children}
      {isLoading && (
        <div className="text-center py-4 text-white/50">
          Cargando más...
        </div>
      )}
      {!hasMore && !isLoading && (
        <div className="text-center py-4 text-white/30 text-sm">
          No hay más elementos
        </div>
      )}
    </div>
  );
}

export default VirtualTable;