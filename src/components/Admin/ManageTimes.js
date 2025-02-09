// src/components/ManageTimes.js
import React, { useEffect, useState } from "react";
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";

const ManageTimes = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBetTimes = async () => {
      const betTimesDoc = await getDoc(doc(db, "betTimes", "times"));
      if (betTimesDoc.exists()) {
        const data = betTimesDoc.data();
        setStartTime(new Date(data.starttime).toISOString().slice(0, 16));
        setEndTime(new Date(data.endtime).toISOString().slice(0, 16));
      }
      setLoading(false);
    };

    fetchBetTimes();
  }, []);

  const updateBetTimes = async () => {
    await setDoc(doc(db, "betTimes", "times"), {
      starttime: new Date(startTime).toISOString(),
      endtime: new Date(endTime).toISOString(),
    });
    alert("Bet times updated successfully!");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="manage-times p-4">
      <h2 className="text-xl font-bold mb-4">Manage Betting Times</h2>
      <div className="mb-4">
        <label className="block mb-2">Start Time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">End Time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <button
        onClick={updateBetTimes}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Update Times
      </button>
    </div>
  );
};

export default ManageTimes; 
