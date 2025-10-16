
import React, { useState, useCallback } from 'react';
import { KaraokeData, LyricsInput } from './types';
import { generateKaraokeLyrics } from './services/geminiService';
import LyricsInputForm from './components/LyricsInputForm';
import KaraokePlayer from './components/KaraokePlayer';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [karaokeData, setKaraokeData] = useState<KaraokeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState<boolean>(false);

  const handleGenerate = useCallback(async (input: LyricsInput) => {
    setIsLoading(true);
    setError(null);
    setKaraokeData(null);
    setShowPlayer(false);
    try {
      const result = await generateKaraokeLyrics(input.lyricsText, input.duration, input.language);
      if (result.error) {
        setError(result.error);
      } else {
        setKaraokeData(result);
        setShowPlayer(true);
      }
    } catch (err) {
      setError('Failed to generate karaoke lyrics. The AI model might be busy or an error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setKaraokeData(null);
    setError(null);
    setShowPlayer(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-glow">
          Karaoke AI
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Generate perfectly timed karaoke lyrics with Gemini
        </p>
      </header>

      <main className="w-full max-w-4xl flex-grow">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          {!showPlayer ? (
            <LyricsInputForm onGenerate={handleGenerate} isLoading={isLoading} />
          ) : (
            karaokeData && <KaraokePlayer karaokeData={karaokeData} onReset={handleReset} />
          )}

          {isLoading && <Loader />}

          {error && !isLoading && (
            <div className="mt-6 text-center text-red-400 bg-red-900/50 p-4 rounded-lg border border-red-700">
              <p className="font-semibold">An Error Occurred</p>
              <p>{error}</p>
               {!showPlayer && <button onClick={() => setError(null)} className="mt-2 px-4 py-1 bg-red-600 hover:bg-red-500 rounded-md text-white text-sm">Try Again</button>}
            </div>
          )}
        </div>
      </main>
      
      <footer className="w-full max-w-4xl text-center text-gray-500 mt-8 text-sm">
        <p>Powered by Google Gemini. UI designed for an amazing karaoke experience.</p>
      </footer>
    </div>
  );
};

export default App;
