
import React from 'react';
import { WordExample } from '../types';

interface WordCardProps {
  wordData: WordExample;
  letter: string;
  onPlaySound: (text: string) => void;
  isPlaying: boolean;
}

const ImagePlaceholder: React.FC = () => (
    <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center animate-pulse">
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    </div>
);


const WordCard: React.FC<WordCardProps> = ({ wordData, letter, onPlaySound, isPlaying }) => {
  const { word, translation, imageUrl } = wordData;

  const highlightedWord = () => {
    const parts = word.split(new RegExp(`(${letter})`, 'i'));
    return parts.map((part, index) =>
      part.toLowerCase() === letter.toLowerCase() ? (
        <span key={index} className="text-red-500 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm transition-all hover:shadow-md hover:bg-green-100/50 border border-transparent hover:border-green-200">
      <div className="flex items-center gap-4">
        {imageUrl ? (
            <img
                src={imageUrl}
                alt={word}
                className="w-14 h-14 rounded-md object-cover bg-gray-50 border border-gray-100"
            />
        ) : (
            <ImagePlaceholder />
        )}
        <div>
          <p className="text-xl font-bold text-gray-800 tracking-wide">{highlightedWord()}</p>
          <p className="text-sm text-gray-500 font-arabic">{translation}</p>
        </div>
      </div>
      <button
        onClick={() => onPlaySound(word)}
        className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
            isPlaying 
            ? 'bg-green-500 text-white shadow-inner scale-95 opacity-90 cursor-default' 
            : 'bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white shadow-sm hover:shadow-md transform hover:scale-110'
        }`}
        disabled={isPlaying}
        aria-label={`استمع لكلمة ${word}`}
        title={isPlaying ? "جاري التشغيل..." : "استمع للنطق"}
      >
        {isPlaying ? (
             <div className="w-5 h-5 animate-pulse">
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-12.728 0a5 5 0 017.072 0" />
                </svg>
            </div>
        ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M12 6L6 10H3v4h3l6 4V6z" />
             </svg>
        )}
      </button>
    </div>
  );
};

export default WordCard;
