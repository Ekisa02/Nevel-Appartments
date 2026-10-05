export const Skeleton = ({ className = '' }) => <div className={`animate-pulse bg-slate-200 rounded-2xl ${className}`} />;
export const CardSkeletons = ({ n = 6 }) => Array.from({ length: n }, (_, i) => <Skeleton key={i} className="h-72" />);
