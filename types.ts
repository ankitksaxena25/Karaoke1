
export interface KaraokeLine {
  start: number;
  end: number;
  text: string;
}

export interface KaraokeData {
  lyrics: KaraokeLine[];
  translatedLyrics?: KaraokeLine[];
  error?: string;
}

export interface LyricsInput {
    lyricsText: string;
    duration: number;
    language: string;
}
