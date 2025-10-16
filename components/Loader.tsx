
import React from 'react';
import { MusicIcon } from './Icons';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 border-4 border-pink-500 rounded-full animate-spin border-t-transparent"></div>
        <MusicIcon className="h-12 w-12 text-pink-400 animate-pulse" />
      </div>
      <p className="text-lg text-gray-300">AI is warming up its vocal cords...</p>
    </div>
  );
};

export default Loader;
