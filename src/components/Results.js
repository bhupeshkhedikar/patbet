import React, { useEffect, useState } from "react";
import AdBanner from "./AdBanner";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fake data for demonstration
    const fakeData = [
      { id: 1, name: "Game 1", createdAt: 1676500000000, winner: "Team A", prize: "$1000" },
      { id: 2, name: "Game 2", createdAt: 1676590000000, winner: "Team B", prize: "$500" },
      { id: 3, name: "Game 3", createdAt: 1676670000000, winner: "Team C", prize: "$2000" },
      { id: 4, name: "Game 4", createdAt: 1676750000000, winner: "Team A", prize: "$300" },
    ];

    // Simulate a network delay
    setTimeout(() => {
      setResults(fakeData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading)
    return (
        <div className="loader-container">
        <div className="loader"></div>
        <p>Loading Results...</p>
      </div>
    );

  return (
    <div style={{ padding: "20px", color: "#fff", textAlign: "center" }}>
      <AdBanner />
      <h2 style={{ color: "#007bff", marginBottom: "20px" }}>Game Results</h2>
      
      {results.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#222",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                <th style={tableHeader}>Game</th>
                <th style={tableHeader}>Date</th>
                <th style={tableHeader}>Winner</th>
                <th style={tableHeader}>Prize</th>
              </tr>
            </thead>
            <tbody>
              {results.map((game) => (
                <tr key={game.id} style={tableRow}>
                  <td style={tableCell}>{game.name || "Unknown"}</td>
                  <td style={tableCell}>
                    {new Date(game.createdAt).toLocaleDateString()}
                  </td>
                  <td style={tableCell}>
                    <span
                      style={{
                        color: "#00ff00",
                        fontWeight: "bold",
                      }}
                    >
                      {game.winner}
                    </span>
                  </td>
                  <td style={tableCell}>{game.prize || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontSize: "16px", color: "gray" }}>No results available</p>
      )}
      <AdBanner />
    </div>
  );
};

// Inline styles for table elements
const tableHeader = {
  padding: "12px",
  textAlign: "center",
  fontWeight: "bold",
  borderBottom: "2px solid #fff",
};

const tableRow = {
  borderBottom: "1px solid #444",
};

const tableCell = {
  padding: "10px",
  textAlign: "center",
  color: "#ddd",
};

export default Results;
