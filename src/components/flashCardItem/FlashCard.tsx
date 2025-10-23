import { Card, IconButton, Stack, Typography } from '@mui/material';
import { VolumeUp, Sync } from '@mui/icons-material';
import { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { FlashcardItem } from '../modals/CreateFlashcardItemModal';

interface FlashcardProps {
  word: FlashcardItem;
  voice: 'US' | 'UK';
}

export default function Flashcard({ word, voice }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const { speak } = useSpeech(voice);

  return (
    <div className='relative h-[300px] md:h-[400px] perspective'>
      {/* Card nền */}
      <Card className='absolute w-full h-full flex items-center justify-center'>
        {/* Nội dung lật */}
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''
            }`}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front */}
          <div className="absolute w-full h-full flex flex-col items-center justify-center backface-hidden px-4">
            {word.image && (
              <img
                src={word.image}
                alt={word.word}
                className="w-24 h-24 object-contain mb-3 rounded-xl shadow-md"
              />
            )}
            <Typography variant="h3" fontWeight="700" className="text-center">
              {word.word}
            </Typography>

            {word.phonetic && (
              <Typography variant="h6" color="text.secondary" className="italic mb-2">
                /{word.phonetic}/
              </Typography>
            )}

            <div className="flex gap-2 items-center">
              <IconButton
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(word.word);
                }}
              >
                <VolumeUp color="primary" />
              </IconButton>
            </div>

            <Typography variant="body2" color="text.disabled" className="mt-3">
              Nhấn để xem nghĩa
            </Typography>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full flex flex-col justify-center items-center backface-hidden rotate-y-180 p-4 text-center overflow-y-auto">
            <div className="mb-8">
              <Typography variant="h5" fontWeight="600" gutterBottom color="primary">
                {word.definition || 'Chưa có nghĩa'}
              </Typography>

              {word.examples && word.examples.length > 0 && (
                <div className="mt-3">
                  {word.examples.map((ex, i) => (
                    <div key={i} className="mb-2 flex gap-2">
                      <Typography variant="body1" fontWeight="500">
                        Ví dụ {i + 1}: “{ex.en}”
                      </Typography>
                      {ex.vi && (
                        <Typography variant="body2" color="text.secondary">
                          → {ex.vi}
                        </Typography>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {word.notes && (
              <Typography
                variant="body2"
                color="text.disabled"
                className="mt-4 italic border-t pt-2 w-full"
              >
                Ghi chú:  {word.notes}
              </Typography>
            )}
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
