import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FiArrowUpRight, FiMaximize, FiMinimize, FiPause, FiPlay, FiRotateCcw, FiVolume2, FiVolumeX } from "react-icons/fi";
import "./VideoPlayer.css";

/** The speeds the speed button steps through, then round to the first again. */
export const SPEEDS = [1, 1.25, 1.5, 2];
const SKIP = 5; // seconds an arrow key moves
const REST = 2500; // ms the pointer can rest while it plays before the controls fade

/** 75 → "1:15", 3725 → "1:02:05"; "0:00" for a length not known yet. */
export const clock = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
};

const share = (part, whole) => (whole > 0 ? `${Math.min(100, (part / whole) * 100)}%` : "0%");

// One video plays at a time: the one that starts pauses the one playing before it.
let playingNow = null;

/**
 * A video with the site's own controls. Before it plays: its still, and one big button with its length.
 * Then a bar: play and pause, the time, a seek bar that shows what's loaded, the speed, the sound and
 * full screen, fading while it plays untouched. Once it has the focus, Space or K plays and pauses, the
 * arrows move 5 seconds, M mutes and F goes full screen. It starts loading when a pointer comes over it,
 * so a press plays at once, and it pauses when it leaves the window or another video starts. A button
 * outside it can start it too, through its ref: `start()` brings it into view and plays.
 */
const VideoPlayer = forwardRef(({ src, poster, label, title = "Watch the demo" }, ref) => {
  const box = useRef(null);
  const video = useRef(null);
  const timer = useRef({ id: 0 }); // the controls' fade while it plays
  const live = useRef(false); // playing now, for the observer below
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(NaN);
  const [loaded, setLoaded] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [full, setFull] = useState(false);
  const [canFull, setCanFull] = useState(false);
  const [resting, setResting] = useState(false);

  // Full screen where the browser allows it: the whole player, or on an iPhone, the phone's own player
  useEffect(() => {
    const d = document;
    setCanFull(Boolean(d.fullscreenEnabled || d.webkitFullscreenEnabled || video.current?.webkitEnterFullscreen));
    const change = () => setFull(Boolean(box.current) && (d.fullscreenElement ?? d.webkitFullscreenElement) === box.current);
    d.addEventListener("fullscreenchange", change);
    d.addEventListener("webkitfullscreenchange", change);
    return () => {
      d.removeEventListener("fullscreenchange", change);
      d.removeEventListener("webkitfullscreenchange", change);
    };
  }, []);

  // Paused when it leaves the window, as when another project's tab is picked
  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el || !v || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting && live.current) v.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Gone: its fade with it, and no longer the video playing
  useEffect(() => {
    const fade = timer.current;
    const v = video.current;
    return () => {
      clearTimeout(fade.id);
      if (playingNow === v) playingNow = null;
    };
  }, []);

  const wake = () => {
    setResting(false);
    clearTimeout(timer.current.id);
    timer.current.id = setTimeout(() => setResting(true), REST);
  };

  // It loads only its length with the page; the rest once a pointer or the focus comes, so a press plays at once
  const warm = () => {
    if (video.current && video.current.preload !== "auto") video.current.preload = "auto";
  };

  const play = () => {
    const v = video.current;
    if (!v) return;
    if (playingNow && playingNow !== v) playingNow.pause();
    v.play()?.catch?.(() => {}); // paused before it started, or the browser said no: nothing to show
  };

  // For a button outside it ("Demo video" under a project's words): into view, then play
  useImperativeHandle(ref, () => ({
    start() {
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      box.current?.scrollIntoView?.({ behavior: still ? "auto" : "smooth", block: "nearest" });
      play();
      box.current?.focus({ preventScroll: true });
    },
  }));

  const toggle = () => {
    if (playing) video.current?.pause();
    else play();
  };

  const seek = (seconds) => {
    const v = video.current;
    if (!v) return;
    const to = Math.max(0, Math.min(seconds, Number.isFinite(length) ? length : 0));
    v.currentTime = to;
    setTime(to);
  };

  const mute = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const faster = () => {
    const v = video.current;
    if (!v) return;
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    v.playbackRate = next;
    setSpeed(next);
  };

  const fullScreen = () => {
    const d = document;
    const el = box.current;
    if (d.fullscreenElement ?? d.webkitFullscreenElement) {
      (d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.())?.catch?.(() => {});
    } else if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el?.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else {
      video.current?.webkitEnterFullscreen?.();
    }
  };

  // Where it is, and how far past that it has loaded
  const measure = () => {
    const v = video.current;
    if (!v) return;
    const now = v.currentTime;
    let ahead = now;
    const ranges = v.buffered;
    for (let i = 0; ranges && i < ranges.length; i += 1) {
      if (ranges.start(i) <= now + 0.5 && ranges.end(i) > ahead) ahead = ranges.end(i);
    }
    setTime(now);
    setLoaded(ahead);
  };

  const onKey = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const onButton = e.target instanceof Element && e.target.closest("button, a");
    const onSeek = e.target instanceof Element && e.target.classList.contains("vp-seek");
    if (key === " " || key === "k") {
      if (onButton) return; // Space presses the button itself
      e.preventDefault();
      toggle();
    } else if (key === "ArrowLeft" || key === "ArrowRight" || (onSeek && (key === "ArrowUp" || key === "ArrowDown"))) {
      e.preventDefault();
      seek((video.current?.currentTime ?? 0) + (key === "ArrowLeft" || key === "ArrowDown" ? -SKIP : SKIP));
    } else if (key === "m") {
      mute();
    } else if (key === "f" && canFull) {
      fullScreen();
    } else {
      return;
    }
    if (playing) wake();
  };

  const known = Number.isFinite(length);

  return (
    <div
      ref={box}
      className={`vp${playing && resting ? " is-resting" : ""}`}
      role="group"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={onKey}
      onPointerEnter={warm}
      onPointerMove={() => {
        if (playing) wake();
      }}
      onPointerLeave={() => {
        if (playing) setResting(true);
      }}
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        onClick={() => {
          if (playing && resting) return wake(); // a tap on a phone shows the controls first
          toggle();
          box.current?.focus({ preventScroll: true });
        }}
        onPlay={() => {
          playingNow = video.current;
          live.current = true;
          setStarted(true);
          setPlaying(true);
          setEnded(false);
          wake();
        }}
        onPause={() => {
          live.current = false;
          if (playingNow === video.current) playingNow = null;
          clearTimeout(timer.current.id);
          setPlaying(false);
          setResting(false);
        }}
        onEnded={() => setEnded(true)}
        onLoadedMetadata={(e) => setLength(e.currentTarget.duration)}
        onDurationChange={(e) => setLength(e.currentTarget.duration)}
        onTimeUpdate={measure}
        onProgress={measure}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        onRateChange={(e) => setSpeed(e.currentTarget.playbackRate)}
        onError={() => setFailed(true)}
      />

      {waiting && playing && <span className="vp-wait" aria-hidden="true" />}

      {(!started || ended) && !failed && (
        <button
          type="button"
          className="vp-start"
          onClick={() => {
            play();
            box.current?.focus({ preventScroll: true });
          }}
          onFocus={warm}
        >
          <span className="vp-start-icon" aria-hidden="true">
            {ended ? <FiRotateCcw /> : <FiPlay className="vp-nudge" />}
          </span>
          <span className="vp-start-text">
            {ended ? "Watch again" : title} <span className="label">{known ? clock(length) : "Video"}</span>
          </span>
        </button>
      )}

      {failed && (
        <div className="vp-failed">
          <p>This video can&apos;t play here.</p>
          <a href={src} target="_blank" rel="noreferrer">
            Open it in a new tab <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
      )}

      {started && !ended && !failed && (
        <div className="vp-bar">
          <input
            className="vp-seek"
            type="range"
            min="0"
            max={known ? length : 0}
            step="any"
            value={Math.min(time, known ? length : 0)}
            disabled={!known}
            aria-label="Seek"
            aria-valuetext={`${clock(time)} of ${clock(length)}`}
            style={{ "--played": share(time, length), "--loaded": share(Math.max(loaded, time), length) }}
            onChange={(e) => seek(Number(e.target.value))}
          />
          <div className="vp-row">
            <button type="button" className="vp-btn" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}
            </button>
            <span className="vp-time label">
              {clock(time)} / {clock(length)}
            </span>
            <span className="vp-gap" />
            <button type="button" className="vp-btn vp-speed" onClick={faster} aria-label={`Speed ${speed}×`}>
              {speed}×
            </button>
            <button type="button" className="vp-btn" onClick={mute} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}
            </button>
            {canFull && (
              <button type="button" className="vp-btn" onClick={fullScreen} aria-label={full ? "Exit full screen" : "Full screen"}>
                {full ? <FiMinimize aria-hidden="true" /> : <FiMaximize aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
