const IconBadge = ({ children, count = 0 }) => {
  const displayCount = count > 99 ? "99+" : count;

  return (
    <div className="indicator">
      {count > 0 && (
        <span className="badge badge-error badge-xs indicator-item text-[10px] text-error-content">
          {displayCount}
        </span>
      )}
      {children}
    </div>
  );
};

export default IconBadge;
