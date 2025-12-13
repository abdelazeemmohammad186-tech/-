import React, { useState, useEffect, useCallback } from 'react';
import { WordExample } from '../types';
import { generateWordsForLetter, generateSpeech, generateImageForWord } from '../services/geminiService';
import WritingCanvas from './WritingCanvas';
import WordCard from './WordCard';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface LetterDetailProps {
  letter: string;
  onBack: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
    </div>
);


const LetterDetail: React.FC<LetterDetailProps> = ({ letter, onBack }) => {
  const [words, setWords] = useState<WordExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playAudio, isPlaying } = useAudioPlayer();
  const [playingText, setPlayingText] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedWords = await generateWordsForLetter(letter);
      setWords(fetchedWords);
    } catch (err) {
      setError('عذراً، حدث خطأ أثناء تحميل الكلمات. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [letter]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    // Check if words are loaded but images are not
    if (words.length > 0 && !words.some(w => w.imageUrl)) {
      const fetchImages = async () => {
        // Use Promise.all to fetch all images in parallel
        const wordsWithImages = await Promise.all(
          words.map(async (wordObject) => {
            try {
              const imageUrl = await generateImageForWord(wordObject.word);
              return { ...wordObject, imageUrl };
            } catch (e) {
              console.error(`Failed to load image for ${wordObject.word}`, e);
              // Return the original object on failure so the UI doesn't break
              return wordObject;
            }
          })
        );
        setWords(wordsWithImages);
      };

      fetchImages();
    }
  }, [words]);

  const handlePlaySound = useCallback(async (text: string) => {
    if (isPlaying) return;
    setPlayingText(text);
    try {
      const audio = await generateSpeech(text);
      await playAudio(audio);
    } catch (error) {
      console.error("Could not play audio for", text, error);
    } finally {
        setPlayingText(null);
    }
  }, [playAudio, isPlaying]);


  return (
    <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-7xl sm:text-9xl font-extrabold text-amber-500 drop-shadow-lg">
            {letter}
            <span className="text-5xl sm:text-7xl">{letter.toLowerCase()}</span>
          </div>
          <button
            onClick={() => handlePlaySound(`Letter ${letter}`)}
            className="p-3 bg-amber-400 text-white rounded-full hover:bg-amber-500 transition-colors shadow-md disabled:bg-gray-400"
            disabled={isPlaying && playingText === `Letter ${letter}`}
            aria-label={`استمع لصوت حرف ${letter}`}
          >
            {isPlaying && playingText === `Letter ${letter}` ? (
                <div className="w-6 h-6 animate-pulse">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-12.728 0a5 5 0 017.072 0" /></svg>
                </div>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M19 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </button>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-transform hover:scale-105 shadow-md"
        >
          العودة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner">
          <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">تدرب على الكتابة</h3>
          <WritingCanvas letter={letter} />
        </div>

        <div className="bg-green-50 p-6 rounded-xl shadow-inner">
          <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">كلمات كمثال</h3>
          {loading ? (
             <LoadingSpinner/>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
              <p>{error}</p>
              <button onClick={fetchWords} className="mt-2 px-4 py-1 bg-red-500 text-white rounded-md">إعادة المحاولة</button>
            </div>
          ) : (
            <div className="space-y-3">
              {words.map((word, index) => (
                <WordCard
                  key={index}
                  wordData={word}
                  letter={letter}
                  onPlaySound={handlePlaySound}
                  isPlaying={isPlaying && playingText === word.word}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterDetail;