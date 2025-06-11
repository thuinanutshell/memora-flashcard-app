// src/components/stats/StudyStreak.jsx

const StudyStreak = ({ streak }) => {
  const getStreakMessage = (days) => {
    if (days === 0) return "Start your study streak today!";
    if (days === 1) return "Great start! Keep it up!";
    if (days < 7) return "Building momentum!";
    if (days < 30) return "Impressive consistency!";
    return "Amazing dedication!";
  };

  const getStreakColor = (days) => {
    if (days === 0) return "secondary";
    if (days < 7) return "warning";
    if (days < 30) return "primary";
    return "success";
  };

  return (
    <div className="card">
      <div className="card-body text-center">
        <i className="bi bi-fire display-4 text-warning mb-3"></i>
        <h2 className={`text-${getStreakColor(streak)} mb-2`}>{streak}</h2>
        <h5 className="card-title mb-2">Day Study Streak</h5>
        <p className="text-muted small">{getStreakMessage(streak)}</p>
      </div>
    </div>
  );
};

export default StudyStreak;