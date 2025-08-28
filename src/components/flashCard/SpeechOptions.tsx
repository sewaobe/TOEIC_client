import { Button } from '@mui/material';

interface Props {
  voice: 'US' | 'UK';
  setVoice: (v: 'US' | 'UK') => void;
}

export default function SpeechOptions({ voice, setVoice }: Props) {
  return (
    <div className='flex gap-2 absolute top-3 right-3'>
      <Button
        size='small'
        variant={voice === 'US' ? 'contained' : 'outlined'}
        onClick={() => setVoice('US')}
      >
        Anh-Mỹ
      </Button>
      <Button
        size='small'
        variant={voice === 'UK' ? 'contained' : 'outlined'}
        onClick={() => setVoice('UK')}
      >
        Anh-Anh
      </Button>
    </div>
  );
}
