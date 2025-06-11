// src/components/review/ReviewResult.jsx

const ReviewResult = ({ deck, results, totalCards, onRestart }) => {
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  const getScoreClass = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getSessionMessage = (avgScore) => {
    if (avgScore >= 80) return 'Excellent work! 🎉';
    if (avgScore >= 60) return 'Good job! Keep practicing! 👍';
    return 'Keep studying! You\'ll get better! 💪';
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-success text-white text-center">
              <h4 className="mb-0">Review Complete!</h4>
            </div>

            <div className="card-body text-center">
              <div className="mb-4">
                <h2 className={`display-4 ${getScoreClass(averageScore)}`}>
                  {averageScore}%
                </h2>
                <p className="text-muted">Average Score</p>
                <h5>{getSessionMessage(averageScore)}</h5>
              </div>

              {/* Summary Stats */}
              <div className="row mb-4">
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h5 className="text-primary">{totalCards}</h5>
                    <small className="text-muted">Cards Reviewed</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h5 className="text-success">
                      {results.filter(r => r.score >= 80).length}
                    </h5>
                    <small className="text-muted">High Scores</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h5 className="text-warning">
                      {results.filter(r => r.score < 80).length}
                    </h5>
                    <small className="text-muted">Need Practice</small>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-center">
                <button 
                  className="btn btn-primary"
                  onClick={onRestart}
                >
                  Review Again
                </button>
                <a 
                  href={`/decks/${deck.id}`}
                  className="btn btn-outline-secondary"
                >
                  Back to Deck
                </a>
                <a 
                  href="/folders"
                  className="btn btn-outline-secondary"
                >
                  All Folders
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewResult;