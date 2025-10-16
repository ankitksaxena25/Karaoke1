
import React, { useState } from 'react';
import { LyricsInput } from '../types';
import { MicIcon, MusicIcon, TimerIcon, LanguagesIcon } from './Icons';

interface LyricsInputFormProps {
  onGenerate: (input: LyricsInput) => void;
  isLoading: boolean;
}

const PRESET_LYRICS = `Hello, it's me
I was wondering if after all these years you'd like to meet
To go over everything
They say that time's supposed to heal ya
But I ain't done much healing
Hello, can you hear me?
I'm in California dreaming about who we used to be
When we were younger and free
I've forgotten how it felt before the world fell at our feet`;


const LyricsInputForm: React.FC<LyricsInputFormProps> = ({ onGenerate, isLoading }) => {
  const [lyricsText, setLyricsText] = useState<string>(PRESET_LYRICS);
  const [duration, setDuration] = useState<number>(290); // Default duration for Adele - Hello
  const [language, setLanguage] = useState<string>('English');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lyricsText.trim() && duration > 0) {
      onGenerate({ lyricsText, duration, language });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-pink-400">Create Your Song</h2>
        <p className="text-gray-400">Enter lyrics, duration, and language to begin.</p>
      </div>

      <div>
        <label htmlFor="lyrics" className="flex items-center text-lg font-medium text-gray-300 mb-2">
            <MusicIcon className="h-5 w-5 mr-2 text-pink-400"/>
            Song Lyrics
        </label>
        <textarea
          id="lyrics"
          value={lyricsText}
          onChange={(e) => setLyricsText(e.target.value)}
          placeholder="Paste your song lyrics here..."
          rows={10}
          className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow duration-300 text-gray-200"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="duration" className="flex items-center text-lg font-medium text-gray-300 mb-2">
            <TimerIcon className="h-5 w-5 mr-2 text-pink-400"/>
            Duration (seconds)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow duration-300 text-gray-200"
            required
            min="1"
          />
        </div>
        <div>
          <label htmlFor="language" className="flex items-center text-lg font-medium text-gray-300 mb-2">
            <LanguagesIcon className="h-5 w-5 mr-2 text-pink-400"/>
            Translate to (Optional)
          </label>
          <select 
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow duration-300 text-gray-200 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Marathi</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Japanese</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-4 px-6 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105"
      >
        <MicIcon className="h-6 w-6 mr-3" />
        {isLoading ? 'Generating...' : 'Generate Karaoke Lyrics'}
      </button>
    </form>
  );
};

export default LyricsInputForm;
