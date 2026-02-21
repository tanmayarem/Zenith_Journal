export default function SidePanel({ data }) {
  if (!data) return null;

  return (
    <div className="sidepanel">
      <p className="sidepanel-tag">{data.distortion}</p>
      <p className="sidepanel-message">{data.message}</p>

      {data.reframe && (
        <div className="sidepanel-reframe">
          <p className="sidepanel-reframe-label">Try reframing it as:</p>
          <p className="sidepanel-reframe-text">"{data.reframe}"</p>
        </div>
      )}
    </div>
  );
}