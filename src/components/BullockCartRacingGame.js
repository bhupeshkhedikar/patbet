import { BorderRight } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';

const BullockCartRacingGame = () => {
        const cartNames = [
          "गोल्डी आणि सिल्व्हर",
          "पर्ल आणि डायमंड",
          "वीर आणि वरद",
          "शक्ती आणि संजीवनी",
          "भैरव आणि भूपाल",
          "रणवीर आणि रणधीर",
          "दत्ता आणि दामोदर",
          "गणेश आणि गजानन",
          "सम्राट आणि सूर्यवीर",
          "यशवंत आणि युगंधर",
          "केसर आणि कृष्णा",
          "मल्लेश आणि मुरलीधर",
          "अग्निवीर आणि तेजस्वी",
          "प्रताप आणि प्रभाकर",
          "शिवराज आणि शौर्यवीर",
          "धनराज आणि देवेंद्र",
          "माझ्या आणि माल्हार",
          "सागर आणि संदीप",
          "आदित्य आणि अविनाश",
          "दीपक आणि दिगंबर",
          "सिंहगर्जना आणि सिंहशक्ती",
          "गजेंद्र आणि गरुडवीर",
          "सिद्धी आणि समाधी",
          "अमर आणि अनंता",
          "ध्रुव आणि दीपक",
          "आकाश आणि अनिल",
          "परशुराम आणि पांडुरंग",
          "भवानी आणि भैरवी",
          "रणधीर आणि रणजित",
          "समर्थ आणि सत्यम",
          "कस्तुरी आणि कमल",
          "माणिक आणि मोती",
          "गंगाधर आणि गोविंद",
          "महादेव आणि मयूरेश",
          "शिवदास आणि सूर्यदास",
          "जगत आणि जनार्दन",
          "चंद्रहास आणि चंद्रशेखर",
          "ज्योति आणि जयहिंद",
          "विजयराज आणि वसंत",
          "अभिषेक आणि अनिरुद्ध",
          "धवल आणि दिवाकर",
          "पवन आणि प्रकाश",
          "संकेत आणि सौरभ",
          "विनायक आणि विशाल",
          "अलख आणि अनमोल",
          "सुप्रिया आणि सुदर्शन",
          "शुभम आणि शशिकांत",
          "राजेंद्र आणि रत्नाकर",
          "कैलास आणि केदारनाथ",
          "त्रिवेणी आणि तीर्थराज",
          "गिरधर आणि गोवर्धन",
          "वरुण आणि वसंत",
          "तुफान आणि तारणहार",
          "रुद्र आणि रक्षक",
          "राघव आणि रत्नेश",
          "वैभव आणि विजय",
          "बलराम आणि बुद्धीवीर",
          "नरसिंह आणि नंदन",
          "संपत आणि सम्राट",
          "वेदांत आणि विनायक",
        ];
      
        const getRandomNames = () => {
          const randomIndex = Math.floor(Math.random() * cartNames.length);
          return cartNames[randomIndex];
        };
      
        const [tracks, setTracks] = useState([
          { id: 1, cart: { id: 1, name: getRandomNames(), position: 0, speed: 0 } },
          { id: 2, cart: { id: 2, name: getRandomNames(), position: 0, speed: 0 } },
        ]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (raceStarted && !raceFinished) {
      const interval = setInterval(() => {
        setTracks((prevTracks) =>
          prevTracks.map((track) => ({
            ...track,
            cart: {
              ...track.cart,
              position: track.cart.position + Math.random() * 10,
              speed: Math.random() * 10,
            },
          }))
        );
      }, 100);

      return () => clearInterval(interval);
    }
  }, [raceStarted, raceFinished]);

  useEffect(() => {
    const isRaceFinished = tracks.some(
      (track) => track.cart.position >= 500
    );
    if (isRaceFinished) {
      setRaceFinished(true);
      setRaceStarted(false);
      determineWinner();
    }
  }, [tracks]);

  const startRace = () => {
    if (selectedCart && betAmount <= balance) {
      setBalance((prevBalance) => prevBalance - betAmount);
      setRaceStarted(true);
      setRaceFinished(false);
      setResult('');
      setTracks([
        { id: 1, cart: { id: 1, name: getRandomNames(), position: 0, speed: 0 } },
        { id: 2, cart: { id: 2, name: getRandomNames(), position: 0, speed: 0 } },
      ]);
    } else {
      alert('Please select a cart and ensure your bet is within your balance.');
    }
  };

  const determineWinner = () => {
    const winner = tracks.reduce((prev, current) =>
      prev.cart.position > current.cart.position ? prev : current
    );
    if (selectedCart === winner.cart.id) {
      const winnings = betAmount * 2;
      setBalance((prevBalance) => prevBalance + winnings);
      setResult(`You won! ${winner.cart.name} is the winner. You won ${winnings} coins!`);
    } else {
      setResult(`You lost! ${winner.cart.name} is the winner.`);
    }
  };

  const resetGame = () => {
    setRaceStarted(false);
    setRaceFinished(false);
    setSelectedCart(null);
    setBetAmount(10);
    setResult('');
    setTracks([
      { id: 1, cart: { id: 1, name: getRandomNames(), position: 0, speed: 0 } },
      { id: 2, cart: { id: 2, name: getRandomNames(), position: 0, speed: 0 } },
    ]);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ऑनलाईन शंकरपट</h1>
          <div style={styles.balance}>आपका बॅलन्स: {balance} coins</div>
          {raceFinished && (
        <div style={styles.resultSection}>
          <h2>{result}</h2>
        </div>
      )}
      <div style={styles.trackContainer}>
        <div style={styles.track}>
          <div style={styles.trackInner}>
            <div
              style={{
                ...styles.cart,
                bottom: `${tracks[0].cart.position}px`,
              }}
            >
              <img
                src="https://i.ibb.co/01y6FtM/image-2-removebg-preview.png"
                alt="Bullock Cart"
                style={styles.cartImage}
              />
            </div>
          </div>
        </div>
        <div style={styles.separator}></div>
        <div style={styles.track}>
          <div style={styles.trackInner}>
            <div
              style={{
                ...styles.cart,
                bottom: `${tracks[1].cart.position}px`,
              }}
            >
              <img
                src="https://i.ibb.co/01y6FtM/image-2-removebg-preview.png"
                alt="Bullock Cart"
                style={styles.cartImage}
              />
            </div>
          </div>
        </div>
      </div>
      {!raceStarted && (
        <div style={styles.bettingSection}>
          <h2>बेट लगाये </h2>
          <div style={styles.cartSelection}>
            {tracks.map((track) => (
              <button
                key={track.cart.id}
                style={{
                  ...styles.cartButton,
                  backgroundColor:
                    selectedCart === track.cart.id ? 'green' : 'chocolate',
                }}
                onClick={() => setSelectedCart(track.cart.id)}
              >
                {track.cart.name} (ट्रॅक {track.id})
              </button>
            ))}
          </div>
          <div style={styles.betAmount}>
            <label>बेट रुपये : </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value, 10))}
              min="10"
              max={balance}
            />
          </div>
          <button style={styles.startButton} onClick={startRace}>
            शर्यत सुरू करा
          </button>
        </div>
      )}
      {raceFinished && (
        <div style={styles.resultSection}>
          <button style={styles.resetButton} onClick={resetGame}>
            पुन्हा खेळा
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0e68c',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: '1.3rem',
    color: '#8b4513',
  },
  balance: {
    fontSize: '1rem',
    margin: '10px 0',
    color: '#8b4513',
  },
  trackContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    margin: '20px 0',
    position: 'relative',
  },
  track: {
    // flex: 1,
      height: '500px',
    width:'150px',
    backgroundColor: '#a0522d',
    borderRadius: '10px',
    border: '2px solid #8b4513',
    position: 'relative',
      overflow: 'hidden',
    BorderRight:'30px solid red'
  },
  trackInner: {
    position: 'relative',
    height: '100%',
    backgroundSize: 'cover',
  },
  cart: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    // width: '30%',
    //   height: '18%',
    transition: 'bottom 0.1s linear',
  },
  cartImage: {
      width: '90%',
      marginLeft:"45px",
    height: '18%',
  },
  separator: {
    width: '2px',
    height: '500px',
    backgroundColor: '#8b4513',
  },
    bettingSection: {
      color:'black',
    marginTop: '20px',
  },
  cartSelection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    margin: '10px 0',
  },
  cartButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#8b4513',
    color: '#fff',
  },
  betAmount: {
    margin: '10px 0',
  },
  startButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#228b22',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
    resultSection: {
        color: 'black',
        fontSize:'0.6rem',
    marginTop: '20px',
  },
  resetButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default BullockCartRacingGame;