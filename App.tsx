
import React, { useState, useCallback, useRef, useEffect } from 'react';
import AlphabetGrid from './components/AlphabetGrid';
import LetterDetail from './components/LetterDetail';
import { ENGLISH_ALPHABET } from './constants';
import { ABC_SONG_URL } from './assets/sounds';

const App: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(ABC_SONG_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMusicOn && !selectedLetter) {
      // Play music if enabled and on the grid view
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio autoplay blocked:", error);
          // Don't disable state, user might want it on, just didn't interact yet.
          // But usually we need interaction.
        });
      }
    } else {
      // Pause if disabled or in detail view
      audio.pause();
    }
  }, [isMusicOn, selectedLetter]);

  const toggleMusic = () => {
    setIsMusicOn(!isMusicOn);
  };

  const handleSelectLetter = useCallback((letter: string) => {
    setSelectedLetter(letter);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setSelectedLetter(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 text-slate-800 p-4 sm:p-6 lg:p-8 relative">
      <button
        onClick={toggleMusic}
        className={`absolute top-4 right-4 sm:top-8 sm:right-8 p-3 rounded-full shadow-lg transition-all duration-300 z-10 ${
          isMusicOn 
            ? 'bg-amber-400 text-white hover:bg-amber-500 rotate-12' 
            : 'bg-white/80 text-gray-400 hover:bg-white'
        }`}
        aria-label={isMusicOn ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
        title={isMusicOn ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
      >
        {isMusicOn ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" stroke="currentColor"/>
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
           </svg>
        )}
      </button>

      <header className="text-center mb-8 pt-4 sm:pt-0">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-700 drop-shadow-md">
          مغامرة الحروف الإنجليزية
        </h1>
        <p className="text-lg sm:text-xl text-blue-600 mt-2">
          تعلم.. العب.. اكتشف!
        </p>
      </header>
      <main className="container mx-auto max-w-7xl">
        {selectedLetter ? (
          <LetterDetail letter={selectedLetter} onBack={handleBackToGrid} />
        ) : (
          <AlphabetGrid alphabet={ENGLISH_ALPHABET} onSelectLetter={handleSelectLetter} />
        )}
      </main>
      <footer className="text-center mt-12 text-sm text-slate-500">
        <p>صنع بحب للأطفال العرب</p>
      </footer>
    </div>
  );
};

export default App;
