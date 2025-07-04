// src/components/PlayerCard.jsx
import React from 'react';

function PlayerCard(props) { // Or destructure: function PlayerCard({ playerName, status })
  return (
    <div style={{ border: '1px solid gray', padding: '10px', margin: '5px' }}>
      <h3>{props.playerName}</h3> {/* Use the prop here */}
      <p>Status: {props.status}</p>
    </div>
  );
}

export default PlayerCard;