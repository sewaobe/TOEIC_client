import { Card, IconButton, Typography } from '@mui/material';
import { VolumeUp, Sync } from '@mui/icons-material';
import { useState } from 'react';

export interface Word {
  word: string;
  meaning: string;
  example: string;
}

interface FlashcardProps {
  word: Word;
  voice: 'US' | 'UK';
}

export default function Flashcard({ word, voice }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    const voices = window.speechSynthesis.getVoices();
    const selected = voices.find((v) =>
      voice === 'US' ? v.lang === 'en-US' : v.lang === 'en-GB',
    );
    if (selected) utterance.voice = selected;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  return (
    <div className='relative h-[300px] md:h-[400px] perspective'>
      {/* Card nền */}
      <Card className='absolute w-full h-full flex items-center justify-center'>
        {/* Nội dung lật */}
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front */}
          <div className='absolute w-full h-full flex flex-col items-center justify-center backface-hidden'>
            <Typography
              variant='h3'
              fontWeight='700'
              className='flex items-center gap-2'
            >
              {word.word}
              <IconButton
                size='large'
                onClick={(e) => {
                  e.stopPropagation();
                  speak();
                }}
              >
                <VolumeUp color='primary' />
              </IconButton>
            </Typography>
          </div>

          {/* Back */}
          <div className='absolute w-full h-full flex flex-col items-center justify-center p-4 text-center backface-hidden rotate-y-180'>
            <Typography variant='h5' gutterBottom>
              {word.meaning}
            </Typography>
            <Typography variant='body1'>{word.example}</Typography>
          </div>
        </div>
      </Card>

      {/* Nút flip riêng */}
      <div className='absolute bottom-3 right-3 z-10'>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setFlipped(!flipped);
          }}
        >
          <Sync />
        </IconButton>
      </div>
    </div>
  );
}
