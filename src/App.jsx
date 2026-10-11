
import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [missionStarted, setMissionStarted] = useState(false);
  
const [missionCompleted, setMissionCompleted] = useState(false);

  const [missionAborted, setMissionAborted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);
  
const [droneAltitude, setDroneAltitude] = useState(2.5);
const [droneSpeed, setDroneSpeed] = useState(1.2);


  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [dronePosition, setDronePosition] = useState({
    top: 46,
    left: 48,
    grid: "A1"
  });

  const [droneTrail, setDroneTrail] = useState([]);
  const [exploredAreas, setExploredAreas] = useState([]);
  const [survivors, setSurvivors] = useState([
  { id: "S1", status: "Unassessed", location: "Room B" },
  { id: "S2", status: "Unassessed", location: "Room C" }
]);

const [selectedSurvivor, setSelectedSurvivor] = useState(null);

  // START WEBCAM
  const startCamera = async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Webcam is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      setCameraError(
        "Cannot access webcam. Allow camera permission and try again."
      );
      console.error(error);
    }
  };

  // STOP WEBCAM
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  // STOP CAMERA WHEN COMPONENT CLOSES
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // MISSION TIMER
  useEffect(() => {
    if (!missionStarted) return;

    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [missionStarted]);

  // SIMULATED DRONE MOVEMENT
  useEffect(() => {
    if (!missionStarted || missionAborted) return;

    const route = [
      { top: 80, left: 12, grid: "A1" },
      { top: 55, left: 25, grid: "A2" },
      { top: 30, left: 40, grid: "B2" },
      { top: 30, left: 60, grid: "B3" },
      { top: 55, left: 50, grid: "C3" },
      { top: 75, left: 35, grid: "C2" },
      { top: 75, left: 65, grid: "D2" },
      { top: 45, left: 80, grid: "D3" }
    ];

    let index = 0;

    const movement = setInterval(() => {
      if (index < route.length) {
        const nextPosition = route[index];

        setDronePosition(nextPosition);
        
setDroneAltitude(Number((1.5 + Math.random() * 2).toFixed(1)));
setDroneSpeed(Number((0.5 + Math.random() * 1.5).toFixed(1)));

        setExploredAreas((areas) => [
  ...areas,
  {
    top: nextPosition.top,
    left: nextPosition.left
  }
]);
        

        setDroneTrail((trail) => [
          ...trail,
          {
            top: nextPosition.top,
            left: nextPosition.left
          }
        ]);

        setMissionProgress(
          Math.round(((index + 1) / route.length) * 100)
        );

        index++;
      } else {
        clearInterval(movement);
        setMissionCompleted(true);
        setMissionStarted(false);
      }
    }, 2000);

    return () => clearInterval(movement);
  }, [missionStarted, missionAborted]);

  // RESET AND START MISSION
  const startMission = () => {
    setMissionAborted(false);
    setMissionCompleted(false);
    setElapsedSeconds(0);
    setMissionProgress(0);

    setDronePosition({
      top: 46,
      left: 48,
      grid: "A1"
    });

    setDroneTrail([]);
    setExploredAreas([]);
setDroneTrail([]);
setMissionProgress(0);
setElapsedSeconds(0);
setMissionAborted(false);
    setMissionStarted(true);
  };

  // EMERGENCY ABORT
  const abortMission = () => {
    setMissionAborted(true);
    setMissionStarted(false);
    setExploredAreas([]);
  setDroneTrail([]);
  setMissionProgress(0);
  };

  return (
    <div className="gcs">
      {/* HEADER */}
      <header className="header">
        <div>
          <h1>NIDAR GCS</h1>
          <p>Indoor Search &amp; Rescue Mission</p>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          SYSTEM READY
        </div>

        
<div className="telemetry">
  <span>📏 Altitude: {droneAltitude} m</span>
  <span>🚀 Speed: {droneSpeed} m/s</span>
  <span>🔋 Battery: 85%</span>
</div>

      </header>

      {/* MAIN CONTENT */}
      <main className="main-grid">
        {/* CAMERA */}
        <section className="panel camera-panel">
          <div className="panel-title">
            <h2>LIVE CAMERA</h2>
            <span className="live">
              {cameraActive ? "● LIVE" : "● OFFLINE"}
            </span>
          </div>

          <div className="camera-screen">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: cameraActive ? "block" : "none"
              }}
            />

            {!cameraActive && (
              <div className="camera-message">
                <span>📷</span>
                <p>{cameraError || "Webcam is not started"}</p>
              </div>
            )}
          </div>

          <div className="camera-controls">
            {!cameraActive ? (
              <button className="start-button" onClick={startCamera}>
                ▶ START WEBCAM
              </button>
            ) : (
              <button className="abort-button" onClick={stopCamera}>
                ■ STOP WEBCAM
              </button>
            )}
          </div>
        </section>

        {/* MAP */}
        <section className="panel map-panel">
          <div className="panel-title">
            <h2>2D MISSION MAP</h2>
            <span>GRID VIEW</span>
          </div>

          <div className="map">
            <div className="room room-a">
              <span>ROOM A</span>
            </div>

            <div className="room room-b">
              <span>ROOM B</span>
            </div>

            <div className="room room-c">
              <span>ROOM C</span>
            </div>

            <div className="room room-d">
              <span>ROOM D</span>
            </div>
            

            {/* CORRIDORS */}
            <div className="corridor corridor-1"></div>
            <div className="corridor corridor-2"></div>
            <div className="corridor corridor-3"></div>
            {/* EXPLORED AREAS */}
{exploredAreas.map((area, index) => (
  <div
    key={index}
    className="explored-area"
    style={{
      top: `${area.top}%`,
      left: `${area.left}%`
    }}
  />
))}

            {/* DRONE TRAIL */}
            {droneTrail.map((point, index) => (
              <div
                key={index}
                className="drone-trail"
                style={{
                  top: `${point.top}%`,
                  left: `${point.left}%`
                }}
              />
            ))}

            {/* DRONE */}
            <div
              className="drone-marker"
              style={{
                top: `${dronePosition.top}%`,
                left: `${dronePosition.left}%`
              }}
            >
              🚁
            </div>

            {/* SURVIVORS */}
           
{/* SURVIVORS */}
{survivors.map((survivor) => (
  <div
    key={survivor.id}
    className={`survivor ${
  survivor.id === "S1" ? "survivor-1" : "survivor-2"
} status-${survivor.status.toLowerCase().replace(/\s+/g, "-")}`}
    onClick={() => setSelectedSurvivor(survivor)}
    title={`Click to tag ${survivor.id}`}
    style={{ cursor: "pointer" }}
  >
    🔴 <span>{survivor.id}</span>
  </div>
))}


            {/* ENTRY AND EXIT */}
            <div className="entry">ENTRY</div>
            <div className="exit">EXIT</div>
          </div>
          <div className="map-legend">
  <span><i className="legend-drone"></i> Drone</span>
  <span><i className="legend-explored"></i> Explored Area</span>
  <span><i className="legend-survivor"></i> Survivor</span>
  <span><i className="legend-unexplored"></i> Unexplored</span>
</div>
        </section>
      </main>
      
{/* SURVIVOR DETAILS */}
{selectedSurvivor && (
  <section className="panel survivor-details">
    <div className="panel-title">
      <h2>SURVIVOR DETAILS — {selectedSurvivor.id}</h2>
      <button onClick={() => setSelectedSurvivor(null)}>
        CLOSE
      </button>
    </div>

    <p>
      <strong>Location:</strong> {selectedSurvivor.location}
    </p>

    <p>
      <strong>Status:</strong> {selectedSurvivor.status}
    </p>

    <label htmlFor="survivor-status">Update Survivor Status</label>

    <select
      id="survivor-status"
      value={selectedSurvivor.status}
      onChange={(event) => {
        const newStatus = event.target.value;

        setSurvivors((previousSurvivors) =>
          previousSurvivors.map((survivor) =>
            survivor.id === selectedSurvivor.id
              ? { ...survivor, status: newStatus }
              : survivor
          )
        );

        setSelectedSurvivor((previous) => ({
          ...previous,
          status: newStatus
        }));
      }}
    >
      <option value="Unassessed">Unassessed</option>
      <option value="Located">Located</option>
      <option value="Needs Assistance">Needs Assistance</option>
      <option value="Rescued">Rescued</option>
    </select>
  </section>
)}


      {/* STATUS BAR */}
      <section className="status-bar">
        <div>
          <span>DRONE</span>
          
<strong>
  {missionAborted
    ? "ABORTED"
    : missionCompleted
    ? "COMPLETED"
    : missionStarted
    ? "FLYING"
    : "READY"}
</strong>

        </div>

        <div>
          <span>MISSION TIME</span>
          <strong>
            {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:
            {String(elapsedSeconds % 60).padStart(2, "0")}
          </strong>
        </div>

        <div>
          <span>POSITION</span>
          <strong>{dronePosition.grid}</strong>
        </div>

        <div>
          <span>SURVIVORS</span>
          <strong>2 / 6</strong>
        </div>

        <div>
          <span>CONNECTION</span>
          <strong className="connected">CONNECTED</strong>
        </div>
      </section>

      {/* MISSION PROGRESS */}
      <section className="panel progress-panel">
        <div className="panel-title">
          <h2>MISSION PROGRESS</h2>
          <strong>{missionProgress}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${missionProgress}%` }}
          />
        </div>
      </section>

      {/* CONTROLS */}
      <section className="controls">
        <button
          className="start-button"
          onClick={startMission}
          disabled={missionStarted}
        >
          {missionStarted ? "● MISSION ACTIVE" : "▶ START MISSION"}
        </button>

        <button className="abort-button" onClick={abortMission}>
          ⚠ EMERGENCY ABORT
        </button>
      </section>
    </div>
  );
}

export default App;
