import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
  card?: {
    label: string;
    render: (item: T) => React.ReactNode;
  };
  className?: string;
  headClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  onRowClick?: (item: T) => void;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
  emptyState: {
    icon?: React.ReactNode;
    title: string;
    description: string;
  };
  pageSize?: number;
  keyExtractor: (item: T) => string;
  cardTitle?: (item: T) => string;
  cardBadge?: (item: T) => React.ReactNode;
  containerClass?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

function SortIcon({ direction, active }: { direction: 'asc' | 'desc'; active: boolean }) {
  return (
    <svg
      className={`w-3 h-3 ml-1.5 transition-all ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'asc' ? (
        <path d="M3 8l3-4 3 4" />
      ) : (
        <path d="M3 4l3 4 3-4" />
      )}
    </svg>
  );
}

function LoadingSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-100">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-5 py-3.5 text-left">
                <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-t border-gray-50">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-5 py-4">
                  <div className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: `${60 + Math.sin(c * 7) * 20}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-2xl p-6 space-y-4 bg-white border-gray-100">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="pt-3 border-t border-gray-100 flex gap-2">
            <div className="h-8 w-full rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-full rounded-lg bg-gray-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon?: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center px-8"
    >
      {icon || (
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">{description}</p>
    </motion.div>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  defaultSort,
  onRowClick,
  viewMode,
  onViewModeChange,
  emptyState,
  pageSize = 20,
  keyExtractor,
  cardTitle,
  cardBadge,
  containerClass,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSort?.direction ?? 'asc');
  const [page, setPage] = useState(0);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const isCardView = viewMode === 'cards';

  return (
    <div className={`rounded-2xl border bg-white overflow-hidden ${containerClass || ''}`} style={{ borderColor: 'rgba(37,99,235,0.08)' }}>
      {/* View toggle + pagination info */}
      {onViewModeChange && data.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(37,99,235,0.06)' }}>
          <p className="text-xs text-gray-400">
            {sorted.length} result{sorted.length !== 1 ? 's' : ''}
            {sorted.length !== data.length && (
              <span className="text-gray-400"> (filtered from {data.length})</span>
            )}
          </p>
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-all ${!isCardView ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Table view"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('cards')}
              className={`p-1.5 rounded-md transition-all ${isCardView ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Card view"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && data.length === 0 && (
        isCardView ? <CardSkeleton /> : <LoadingSkeleton columns={columns.length} />
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <EmptyState icon={emptyState.icon} title={emptyState.title} description={emptyState.description} />
      )}

      {/* Filtered empty state */}
      {!loading && data.length > 0 && sorted.length === 0 && (
        <EmptyState
          title="No results match your filters"
          description="Try adjusting your search or filter criteria."
        />
      )}

      {/* Table view */}
      {!loading && data.length > 0 && !isCardView && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(37,99,235,0.06)' }}>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-5 py-3.5 text-left ${col.sortable ? 'cursor-pointer select-none group' : ''} ${col.headClassName || ''}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                        {col.header}
                        {col.sortable && (
                          <SortIcon
                            direction={sortDir}
                            active={sortKey === col.key}
                          />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {pageData.map((item, i) => (
                    <motion.tr
                      key={keyExtractor(item)}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, delay: i * 0.02, ease }}
                      onClick={() => onRowClick?.(item)}
                      className={`group border-t transition-all duration-150 ${onRowClick ? 'cursor-pointer' : ''} hover:bg-blue-50/30`}
                      style={{ borderColor: 'rgba(37,99,235,0.04)' }}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`px-5 py-4 whitespace-nowrap ${col.className || ''}`}>
                          {col.render(item)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'rgba(37,99,235,0.06)' }}>
              <p className="text-xs text-gray-400">
                Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs text-gray-400 tabular-nums min-w-[4rem] text-center">
                  Page {safePage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Card view */}
      {!loading && data.length > 0 && isCardView && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            <AnimatePresence mode="popLayout">
              {pageData.map((item, i) => (
                <motion.div
                  key={keyExtractor(item)}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, delay: i * 0.02, ease }}
                  onClick={() => onRowClick?.(item)}
                  className={`bg-white border rounded-2xl p-5 transition-all hover:shadow-md ${onRowClick ? 'cursor-pointer' : ''}`}
                  style={{ 
                    borderColor: 'rgba(37,99,235,0.08)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Card header */}
                  {(cardTitle || cardBadge) && (
                    <div className="flex items-start justify-between mb-4">
                      {cardTitle && (
                        <p className="text-sm font-semibold text-gray-700 leading-snug">{cardTitle(item)}</p>
                      )}
                      {cardBadge && (
                        <div className="shrink-0 ml-2">{cardBadge(item)}</div>
                      )}
                    </div>
                  )}

                  {/* Card fields */}
                  <div className="space-y-3">
                    {columns
                      .filter((col) => col.card)
                      .map((col) => (
                        <div key={col.key}>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                            {col.card!.label}
                          </p>
                          <div className="text-sm text-gray-600">
                            {col.card!.render(item)}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Fallback: show all columns as rows if no card config */}
                  {!columns.some((c) => c.card) && columns.map((col) => (
                    <div key={col.key} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{col.header}</span>
                      <span className="text-sm text-gray-600 text-right truncate ml-2">{col.render(item)}</span>
                    </div>
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination (card view) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'rgba(37,99,235,0.06)' }}>
              <p className="text-xs text-gray-400">
                Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs text-gray-400 tabular-nums min-w-[4rem] text-center">
                  Page {safePage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}