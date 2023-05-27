import "./App.css";
import ReactAudioPlayer from "react-audio-player";
import { useState, useEffect } from "react";

const breatheInTime = 4;
const holdTime = 7;
const exhaleTime = 8;
const holdTimeSlot = breatheInTime + holdTime;
const exhaleTimeSlot = holdTimeSlot + exhaleTime;

const colorSet = ["#84bbaa", "#81a9b6", "#8183b6"];

function createAudio(path, vol = 1) {
  let audio = new Audio(path);
  audio.volume = vol;
  return audio;
}

const activeAudio = {
  music: createAudio("audio/please-calm-my-mind-125566.mp3"),
  beat: createAudio("audio/24[kb]bonger-kick.wav.mp3"),
  in: createAudio("audio/in2.mp3"),
  hold: createAudio("audio/hold2.mp3"),
  out: createAudio("audio/out2.mp3"),
};

function playAudio(key, vol = 1) {
  if (activeAudio[key]) {
    activeAudio[key].volume = vol;
    activeAudio[key].play();
  }
}

function pauseAudio(key) {
  activeAudio[key]?.pause();
}

function resetAudio(index) {
  if (activeAudio[index]) {
    activeAudio[index].currentTime = 0;
  }
}

function OsuClicker(props) {
  return (
    <button
      style={props.style}
      className={`OsuClicker ${props.active && "active"}`}
      onClick={() => {
        playAudio("beat", 0.1);
      }}
    >
      {props.number + 1}
    </button>
  );
}

let interval = null;

function App() {
  const [start, setStart] = useState(false);
  const [osuGrid, setOsuGrid] = useState(false);
  const [count, setCount] = useState(null);

  const cycleCount = count % exhaleTimeSlot;
  if (start && cycleCount === 0) playAudio("in");
  if (start && cycleCount === breatheInTime) playAudio("hold");
  if (start && cycleCount === holdTimeSlot) playAudio("out");

  // console.log("start", start);
  console.log("count", count, cycleCount);
  // console.log("interval", interval);

  // Timer
  useEffect(() => {
    if (start && !interval) {
      interval = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount === null) return 1;
          return prevCount + 1;
        });
      }, 1000);
    } else {
      interval = clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [start]);

  useEffect(() => {
    if (start) {
      playAudio("music", 0.02);
    } else {
      pauseAudio("music");
      resetAudio("music");
    }
  }, [start]);

  const osuButtonsIn = createOsuButtons(4, colorSet[0], 0);
  const osuButtonsHold = createOsuButtons(7, colorSet[1], 4);
  const osuButtonsOut = createOsuButtons(8, colorSet[2], 11);

  const determineTextToDisplay = () => {
    if (cycleCount < breatheInTime) return "Breath In";
    if (cycleCount < holdTimeSlot) return "Hold";
    return "Breath Out";
  };

  // RENDER
  return (
    <div className="App">
      <button
        className={`beginButton round ${start && "shrink"}`}
        onClick={() => {
          start && setCount(null);
          setStart(!start);
        }}
      >
        {start ? "PAUSE" : "RELAX"}
      </button>
      {/* <button onClick={beat}>BEAT</button> */}

      <div className={`osuArea fade ${start ? "in" : "out"}`}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {determineTextToDisplay()}
        </div>

        {osuButtonsIn}
        {osuButtonsHold}
        {osuButtonsOut}
      </div>
      <div className="counter">
        {cycleCount}/{count}
      </div>
    </div>
  );

  // HELPER
  function createOsuButtons(num, backgroundColor, offSet) {
    const degPerButton = 360 / num;
    const buttons = [];
    for (let x = 0; x < num; x++) {
      let deg = x * degPerButton;
      const buttonIndex = x + offSet;
      buttons.push(
        <div
          key={buttonIndex}
          style={{
            position: `absolute`,
            padding: `10px`,
            height: `calc(100% - 20px)`,
            width: `calc(100% - 20px)`,
            transform: `rotate(${deg}deg)`,
            textAlign: `center`,
          }}
        >
          <OsuClicker
            number={x}
            visible={true}
            active={determineActive(buttonIndex, cycleCount)}
            style={{ transform: `rotate(-${deg}deg)`, backgroundColor }}
          ></OsuClicker>
        </div>
      );
    }
    return buttons;
    function determineActive(index, count) {
      return index === count;
    }
  }
}

export default App;
