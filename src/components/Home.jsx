import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  const fetchEntries = () => {
    axios.get("http://localhost:8000/entries")
      .then(res => setEntries(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`http://localhost:8000/entries/${id}`);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Delete failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleCardClick = (entry) => {
    navigate("/journal", { state: { entry } });
  };

  return (
    <div className="home-wrapper">
      <div className="home-frame">
        <div className="bow">🎀</div>
        <div className="cherries">🍒</div>

        <h1 className="home-title">Journal</h1>

        <div className="entries-grid">
          {/* New entry card always first */}
          <div
            className="entry-card entry-card-new"
            onClick={() => navigate("/journal")}
          >
            <span className="entry-card-plus">+</span>
          </div>

          {entries.map(entry => (
            <div
              key={entry.id}
              className="entry-card"
              onClick={() => handleCardClick(entry)}
            >
              <div className="entry-card-toprow">
                <button
                  className="entry-delete-btn"
                  onClick={(e) => handleDelete(e, entry.id)}
                  title="Delete entry"
                >
                  ×
                </button>
              </div>
              <p className="entry-card-title">{entry.title}</p>
              <p className="entry-card-preview">
                {entry.text.slice(0, 80)}...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}