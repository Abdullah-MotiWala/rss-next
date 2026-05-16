export default function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-bars">
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
      </div>
      <div className="loading-text">Going to press...</div>
      <div className="loading-detail">
        Loading main feeds — additional categories available on demand
      </div>
    </div>
  );
}
