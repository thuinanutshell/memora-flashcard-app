// src/components/stats/StatsCard.jsx

const StatsCard = ({ title, value, subtitle, icon, color = "primary" }) => {
  return (
    <div className="card h-100">
      <div className="card-body text-center">
        {icon && (
          <i className={`bi bi-${icon} display-6 text-${color} mb-2`}></i>
        )}
        <h3 className={`text-${color} mb-1`}>{value}</h3>
        <h6 className="card-title mb-1">{title}</h6>
        {subtitle && (
          <small className="text-muted">{subtitle}</small>
        )}
      </div>
    </div>
  );
};

export default StatsCard;