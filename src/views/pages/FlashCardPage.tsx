import { useState, useEffect } from 'react';
import Flashcard, { Word } from '../../components/flashCard/FlashCard';
import Header from '../../components/flashCard/Header';
import Menu from '../../components/flashCard/Menu';
import AlertBox from '../../components/flashCard/AlertBox';
import SpeechOptions from '../../components/flashCard/SpeechOptions';
import EvaluationSection from '../../components/flashCard/EvaluationSection';
import MainLayout from '../layouts/MainLayout';

const words: Word[] = [
  {
    word: 'fascinating',
    meaning: 'hấp dẫn, lôi cuốn',
    example: 'The book was absolutely fascinating.',
  },
  {
    word: 'phenomenon',
    meaning: 'hiện tượng',
    example: 'Climate change is a global phenomenon.',
  },
  {
    word: 'procrastinate',
    meaning: 'trì hoãn',
    example: 'I tend to procrastinate when I have a difficult task.',
  },
  {
    word: 'resilience',
    meaning: 'khả năng phục hồi',
    example: 'She showed great resilience after the accident.',
  },
  {
    word: 'ubiquitous',
    meaning: 'có mặt ở khắp mọi nơi',
    example: 'Smartphones are now ubiquitous.',
  },
];

export default function FlashcardPage() {
  const [index, setIndex] = useState(0);
  const [voice, setVoice] = useState<'US' | 'UK'>('US');

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % words.length);
  };

  // 🔹 Auto speak khi đổi từ hoặc voice
  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance(words[index].word);
    utterance.lang = voice === 'US' ? 'en-US' : 'en-GB';
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [index, voice]);

  return (
    <MainLayout>
      <div className='max-w-3xl mx-auto p-4'>
        <Header />
        <Menu />
        <AlertBox />
        <div className='relative'>
          <Flashcard word={words[index]} voice={voice} />
          <SpeechOptions voice={voice} setVoice={setVoice} />
        </div>
        <EvaluationSection onNext={handleNext} />
      </div>
    </MainLayout>
  );
}
