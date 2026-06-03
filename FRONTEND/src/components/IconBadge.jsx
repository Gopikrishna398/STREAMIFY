const IconBadge = ({ children, count = 0 }) => {
  const displayCount = count > 99 ? "99+" : count;

  return (
    <div className="indicator">
      {count > 0 && (
        <span className="badge badge-error badge-sm indicator-item text-[10px] text-error-content font-bold px-1 min-h-4 h-4 min-w-4 w-auto flex items-center justify-center shadow-sm">
          {displayCount}
        </span>
      )}
      {children}
    </div>
  );
};

export default IconBadge;
