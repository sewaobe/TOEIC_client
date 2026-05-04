import { Box, Card, IconButton, Stack, Typography } from '@mui/material';
import { VolumeUp, Sync } from '@mui/icons-material';
import { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { FlashcardItem } from '../modals/CreateFlashcardItemModal';
import { parseVocabularyNotes } from '../../views/pages/FlashcardDetailPage';

interface FlashcardProps {
  word: FlashcardItem;
  voice: 'US' | 'UK';
}

export default function Flashcard({ word, voice }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const { speak } = useSpeech(voice);

  const parsedNotes = parseVocabularyNotes(word.notes);

  const hasParsedNotes =
    parsedNotes.phrases.length > 0 ||
    parsedNotes.synonyms.length > 0 ||
    parsedNotes.others.length > 0;

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
            {word.image && word.image !== "https://placehold.co/600x400/png?text=Vocabulary" && (
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
                <Box sx={{ mt: 3 }}>
                  {word.examples.map((ex, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        Ví dụ {i + 1}: “{ex.en}”
                      </Typography>

                      {ex.vi && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            pl: 1,
                            overflowWrap: "anywhere",
                          }}
                        >
                          → {ex.vi}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </div>

            {hasParsedNotes && (
              <Box
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  width: "100%",
                  color: "text.secondary",
                }}
              >
                {parsedNotes.phrases.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "text.disabled",
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      Cụm từ
                    </Typography>

                    <Box
                      sx={{
                        mt: 0.75,
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 0.75,
                      }}
                    >
                      {parsedNotes.phrases.map((phrase, index) => (
                        <Typography
                          key={`phrase-${index}`}
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.35,
                            borderRadius: 999,
                            bgcolor: "rgba(0,0,0,0.04)",
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          {phrase}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {parsedNotes.synonyms.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "text.disabled",
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      Từ đồng nghĩa
                    </Typography>

                    <Box
                      sx={{
                        mt: 0.75,
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 0.75,
                      }}
                    >
                      {parsedNotes.synonyms.map((synonym, index) => (
                        <Typography
                          key={`synonym-${index}`}
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.35,
                            borderRadius: 999,
                            bgcolor: "rgba(37,99,235,0.08)",
                            color: "primary.main",
                            fontStyle: "italic",
                          }}
                        >
                          {synonym}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {parsedNotes.others.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "text.disabled",
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      Ghi chú
                    </Typography>

                    <Box
                      sx={{
                        mt: 0.75,
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 0.75,
                      }}
                    >
                      {parsedNotes.others.map((item, index) => (
                        <Typography
                          key={`note-other-${index}`}
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.35,
                            borderRadius: 999,
                            bgcolor: "rgba(0,0,0,0.04)",
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
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
