
import React from 'react';

interface AlphabetGridProps {
  alphabet: string[];
  onSelectLetter: (letter: string) => void;
}

const AlphabetGrid: React.FC<AlphabetGridProps> = ({ alphabet, onSelectLetter }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">اختر حرفاً لتبدأ</h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3 sm:gap-4">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => onSelectLetter(letter)}
            className="aspect-square flex items-center justify-center text-3xl sm:text-4xl font-bold text-white bg-blue-500 rounded-xl shadow-md transition-all duration-300 ease-in-out hover:bg-blue-600 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlphabetGrid;
