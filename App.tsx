
import React, { useState, useCallback } from 'react';
import AlphabetGrid from './components/AlphabetGrid';
import LetterDetail from './components/LetterDetail';
import { ENGLISH_ALPHABET } from './constants';

const App: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const handleSelectLetter = useCallback((letter: string) => {
    setSelectedLetter(letter);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setSelectedLetter(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 text-slate-800 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
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
