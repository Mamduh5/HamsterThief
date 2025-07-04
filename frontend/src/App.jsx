import React, { useState } from 'react';
import PlayerCard from './components/PlayerCard';
import './App.css';
import Counter from './components/BacisCounter';
import LoginPage from './pages/LoginPage';

function App() {
  const [gamePhase, setGamePhase] = useState('lobby');

  const handleStartGame = () => {
    setGamePhase('in-game');
  };

  const handleBackToLobby = () => {
    setGamePhase('lobby');
  };

  const handleLoginPage = () => {
    setGamePhase('login-page');
  };

  // If login page, render ONLY the login page (no App wrapper)
  if (gamePhase === 'login-page') {
    return <LoginPage />;
  }

  // Otherwise, render the normal App layout
  return (
    <div className="App">
      <h1>Welcome to Town of Salem!</h1>
      <p>Go to login page</p>
      <button onClick={handleLoginPage}>Login Page</button>
      <p>Current Phase: {gamePhase}</p>

      {gamePhase === 'lobby' && (
        <>
          <PlayerCard playerName="Mam" status="Online" />
          <PlayerCard playerName="Toey" status="Online" />
          <button onClick={handleStartGame}>Start Game</button>
        </>
      )}

      {gamePhase === 'in-game' && (
        <>
          <p>The game has started! Players are now in the night phase.</p>
          <Counter />
          <br />
          <button onClick={handleBackToLobby}>Back to lobby</button>
        </>
      )}
    </div>
  );
}

export default App;