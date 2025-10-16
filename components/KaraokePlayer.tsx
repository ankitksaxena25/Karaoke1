import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Howl } from 'howler';
import { KaraokeData, KaraokeLine } from '../types';
import { PlayIcon, PauseIcon, RotateCcwIcon, LanguagesIcon } from './Icons';

interface KaraokePlayerProps {
  karaokeData: KaraokeData;
  onReset: () => void;
}

const KaraokePlayer: React.FC<KaraokePlayerProps> = ({ karaokeData, onReset }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  
  const soundRef = useRef<Howl | null>(null);
  const animationFrameRef = useRef<number>();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const lyricsToDisplay = useMemo(() => 
    (showTranslation && karaokeData.translatedLyrics) ? karaokeData.translatedLyrics : karaokeData.lyrics,
    [showTranslation, karaokeData]
  );

  useEffect(() => {
    // Using a free instrumental track for demonstration
    const sound = new Howl({
      src: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'],
      html5: true,
      onplay: () => {
        setIsPlaying(true);
        trackProgress();
      },
      onpause: () => setIsPlaying(false),
      onstop: () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentIndex(-1);
      },
      onend: () => {
        setIsPlaying(false);
        setProgress(100);
        setCurrentIndex(lyricsToDisplay.length);
      },
    });
    soundRef.current = sound;

    return () => {
      sound.unload();
      if(animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackProgress = useCallback(() => {
    const sound = soundRef.current;
    if (!sound || !sound.playing()) {
      if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const time = sound.seek() as number;
    const duration = sound.duration();
    setProgress((time / duration) * 100);

    const activeIndex = lyricsToDisplay.findIndex(
      (line) => time >= line.start && time <= line.end
    );
    
    if (activeIndex !== -1 && activeIndex !== currentIndex) {
      setCurrentIndex(activeIndex);
    }
    // FIX: Wrap trackProgress in an arrow function to ensure it's called with a consistent argument signature, preventing potential type errors.
    animationFrameRef.current = requestAnimationFrame(() => trackProgress());
  }, [currentIndex, lyricsToDisplay]);

  useEffect(() => {
    const activeElement = document.getElementById(`lyric-${currentIndex}`);
    if (activeElement && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const elementRect = activeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const scrollPosition = activeElement.offsetTop - container.offsetTop - (container.clientHeight / 2) + (elementRect.height / 2);
      
      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);
  
  const togglePlay = () => {
    const sound = soundRef.current;
    if (!sound) return;
    if (sound.playing()) {
      sound.pause();
    } else {
      sound.play();
    }
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const sound = soundRef.current;
    if (!sound) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = x / width;
    const newTime = sound.duration() * newProgress;
    sound.seek(newTime);
  }

  const getLineClass = (index: number) => {
    if (index === currentIndex) {
      return 'text-pink-400 font-bold text-3xl md:text-4xl scale-105 opacity-100';
    }
    if (index === currentIndex - 1 || index === currentIndex - 2) {
      return 'text-gray-500 opacity-60 text-xl md:text-2xl';
    }
    return 'text-gray-300 opacity-80 text-xl md:text-2xl';
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div 
        ref={lyricsContainerRef}
        className="lyrics-container flex-grow overflow-y-auto p-4 text-center space-y-4 transition-all duration-500 scroll-smooth"
        style={{maskImage: 'linear-gradient(transparent 0%, black 20%, black 80%, transparent 100%)'}}
      >
        {lyricsToDisplay.map((line, i) => (
          <p
            key={i}
            id={`lyric-${i}`}
            className={`transition-all duration-500 ease-in-out ${getLineClass(i)}`}
          >
            {line.text}
          </p>
        ))}
      </div>
      <div className="player-controls mt-6 p-4 bg-gray-900/50 rounded-b-xl border-t border-gray-700">
        <div className="w-full bg-gray-700 rounded-full h-2.5 cursor-pointer" onClick={handleProgressClick}>
          <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <button
            onClick={onReset}
            className="p-3 text-gray-300 hover:text-white transition-colors"
            title="New Song"
          >
            <RotateCcwIcon className="h-6 w-6" />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 bg-pink-600 rounded-full text-white shadow-lg hover:bg-pink-500 transform hover:scale-110 transition-all"
          >
            {isPlaying ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}
          </button>
          <button
            onClick={() => setShowTranslation(prev => !prev)}
            disabled={!karaokeData.translatedLyrics}
            className="p-3 text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            title="Toggle Translation"
          >
            <LanguagesIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KaraokePlayer;