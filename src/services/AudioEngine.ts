import { Song } from '../types/music';
import { DEFAULT_EQ_FREQUENCIES } from '../utils/audioMath';

export type PlaybackStatusListener = (state: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}) => void;

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private stereoPanner: StereoPannerNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Synthesizer nodes for demo songs
  private synthGain: GainNode | null = null;
  private synthOscillators: OscillatorNode[] = [];
  private synthInterval: number | null = null;

  private currentSong: Song | null = null;
  private isPlaying: boolean = false;
  private playbackListeners: Set<PlaybackStatusListener> = new Set();
  private updateTimer: number | null = null;
  private simulatedTime: number = 0;
  private simulatedDuration: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audioElement) return;
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('timeupdate', () => {
      this.notifyListeners();
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notifyListeners();
      if (this.onTrackEndedCallback) {
        this.onTrackEndedCallback();
      }
    });

    this.audioElement.addEventListener('error', () => {
      // If audio file has error or empty URL, smoothly fallback to synthesizer
      if (this.currentSong && !this.currentSong.audioUrl) {
        this.startSynthPlayback();
      }
    });
  }

  private onTrackEndedCallback: (() => void) | null = null;
  public setOnTrackEnded(callback: () => void) {
    this.onTrackEndedCallback = callback;
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1.0;

      // Analyser for real-time visualization
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      // Stereo Panner
      if (this.audioCtx.createStereoPanner) {
        this.stereoPanner = this.audioCtx.createStereoPanner();
      }

      // Dynamics Compressor (Loudness)
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Bass Boost Low-Shelf Filter (80 Hz)
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 80;
      this.bassFilter.gain.value = 0;

      // Treble Boost High-Shelf Filter (10 kHz)
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 10000;
      this.trebleFilter.gain.value = 0;

      // 10-Band Equalizer Filters
      this.eqFilters = DEFAULT_EQ_FREQUENCIES.map((freq) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4; // 1-octave bandwidth
        filter.gain.value = 0;
        return filter;
      });

      // Chain: Filters -> Bass -> Treble -> Panner -> Compressor -> Analyser -> Master Gain -> Destination
      let lastNode: AudioNode = this.eqFilters[0];
      for (let i = 1; i < this.eqFilters.length; i++) {
        lastNode.connect(this.eqFilters[i]);
        lastNode = this.eqFilters[i];
      }

      lastNode.connect(this.bassFilter);
      this.bassFilter.connect(this.trebleFilter);

      let preOutput: AudioNode = this.trebleFilter;
      if (this.stereoPanner) {
        preOutput.connect(this.stereoPanner);
        preOutput = this.stereoPanner;
      }

      preOutput.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);

      // Connect HTMLAudioElement to the start of the chain
      if (this.audioElement) {
        try {
          this.mediaSourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
          this.mediaSourceNode.connect(this.eqFilters[0]);
        } catch {
          // Already connected
        }
      }

      // Synth Gain Node for demo generator
      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.value = 0.15;
      this.synthGain.connect(this.eqFilters[0]);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public async playSong(song: Song, startPosition: number = 0) {
    this.ensureAudioContext();
    this.currentSong = song;

    // Update MediaSession metadata for lock screen & background controls
    this.updateMediaSessionMetadata(song);

    if (song.audioUrl && song.audioUrl.trim().length > 0) {
      this.stopSynthPlayback();
      if (this.audioElement) {
        this.audioElement.src = song.audioUrl;
        this.audioElement.currentTime = startPosition;
        try {
          await this.audioElement.play();
          this.isPlaying = true;
        } catch {
          // Auto-play blocked or unsupported, fallback to synth demo
          this.startSynthPlayback(startPosition);
        }
      }
    } else {
      // Procedural sound synthesizer demo for pre-loaded tracks
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.startSynthPlayback(startPosition);
    }

    this.notifyListeners();
  }

  public async resume() {
    this.ensureAudioContext();
    if (this.currentSong?.audioUrl && this.audioElement) {
      try {
        await this.audioElement.play();
        this.isPlaying = true;
      } catch {
        this.startSynthPlayback(this.simulatedTime);
      }
    } else {
      this.startSynthPlayback(this.simulatedTime);
    }
    this.notifyListeners();
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynthPlayback();
    this.notifyListeners();
  }

  public seek(seconds: number) {
    if (this.currentSong?.audioUrl && this.audioElement) {
      this.audioElement.currentTime = seconds;
    } else {
      this.simulatedTime = seconds;
    }
    this.notifyListeners();
  }

  public setVolume(volume: number) {
    // volume is 0 to 1
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
  }

  public setBandGain(bandIndex: number, gainDb: number) {
    this.ensureAudioContext();
    if (this.eqFilters[bandIndex] && this.audioCtx) {
      this.eqFilters[bandIndex].gain.setTargetAtTime(gainDb, this.audioCtx.currentTime, 0.05);
    }
  }

  public setAllBands(gains: number[]) {
    this.ensureAudioContext();
    gains.forEach((g, idx) => {
      this.setBandGain(idx, g);
    });
  }

  public setBassBoost(percent: number) {
    this.ensureAudioContext();
    if (this.bassFilter && this.audioCtx) {
      // 0 to 100% maps to 0 to +12 dB
      const gain = (percent / 100) * 12;
      this.bassFilter.gain.setTargetAtTime(gain, this.audioCtx.currentTime, 0.05);
    }
  }

  public setTrebleTone(toneDb: number) {
    this.ensureAudioContext();
    if (this.trebleFilter && this.audioCtx) {
      this.trebleFilter.gain.setTargetAtTime(toneDb, this.audioCtx.currentTime, 0.05);
    }
  }

  public setPlaybackSpeed(speed: number) {
    const clamped = Math.max(0.5, Math.min(2.5, speed));
    if (this.audioElement) {
      this.audioElement.playbackRate = clamped;
    }
  }

  public setStereoBalance(pan: number) {
    this.ensureAudioContext();
    if (this.stereoPanner && this.audioCtx) {
      this.stereoPanner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), this.audioCtx.currentTime, 0.05);
    }
  }

  public getVisualizerData(frequencyArray: Uint8Array, waveformArray: Uint8Array) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(frequencyArray as unknown as Uint8Array<ArrayBuffer>);
      this.analyser.getByteTimeDomainData(waveformArray as unknown as Uint8Array<ArrayBuffer>);
    }
  }

  public subscribe(listener: PlaybackStatusListener): () => void {
    this.playbackListeners.add(listener);
    return () => this.playbackListeners.delete(listener);
  }

  private notifyListeners() {
    const isAudioPlaying = this.audioElement && !this.audioElement.paused;
    const isPlaying = this.isPlaying || Boolean(isAudioPlaying);
    const currentTime = this.currentSong?.audioUrl && this.audioElement
      ? this.audioElement.currentTime
      : this.simulatedTime;
    const duration = this.currentSong?.audioUrl && this.audioElement && this.audioElement.duration
      ? this.audioElement.duration
      : (this.currentSong?.duration || this.simulatedDuration || 200);

    const state = { isPlaying, currentTime, duration };
    this.playbackListeners.forEach((fn) => fn(state));
  }

  // Fallback Procedural Ambient Audio Generator for Demo Songs
  private startSynthPlayback(startSec: number = 0) {
    this.ensureAudioContext();
    this.stopSynthPlayback();
    this.isPlaying = true;
    this.simulatedTime = startSec;
    this.simulatedDuration = this.currentSong?.duration || 214;

    const notes = [130.81, 164.81, 196.0, 246.94, 293.66, 329.63]; // C3 major pentatonic ambient chord
    const osc1 = this.audioCtx!.createOscillator();
    const osc2 = this.audioCtx!.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.value = notes[0];
    osc2.frequency.value = notes[2] / 2; // sub-bass

    osc1.connect(this.synthGain!);
    osc2.connect(this.synthGain!);
    osc1.start();
    osc2.start();
    this.synthOscillators = [osc1, osc2];

    let noteStep = 0;
    this.synthInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.simulatedTime += 0.25;
      if (this.simulatedTime >= this.simulatedDuration) {
        this.pause();
        this.simulatedTime = 0;
        if (this.onTrackEndedCallback) this.onTrackEndedCallback();
      }

      // Modulate ambient frequencies every 3 seconds
      if (Math.floor(this.simulatedTime) % 3 === 0 && osc1 && this.audioCtx) {
        noteStep = (noteStep + 1) % notes.length;
        osc1.frequency.setTargetAtTime(notes[noteStep], this.audioCtx.currentTime, 0.8);
      }
      this.notifyListeners();
    }, 250);
  }

  private stopSynthPlayback() {
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.synthOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.synthOscillators = [];
  }

  private updateMediaSessionMetadata(song: Song) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: song.artworkUrl
        ? [
            { src: song.artworkUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: song.artworkUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: song.artworkUrl, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    });
  }

  public registerMediaSessionHandlers(handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSeek: (time: number) => void;
  }) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        handlers.onSeek(details.seekTime);
      }
    });
  }
}

export const audioEngine = new AudioEngine();
