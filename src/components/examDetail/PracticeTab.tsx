import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import PartSelector from './PartSelector';
import { Part } from '../../types/examDetail';

interface PracticeTabProps {
  parts: Part[];
  selectedParts: string[];
  togglePart: (label: string) => void;
  timeLimit: string;
  setTimeLimit: (value: string) => void;
  onPractice: () => void;
}

const PracticeTab: React.FC<PracticeTabProps> = ({
  parts,
  selectedParts,
  togglePart,
  timeLimit,
  setTimeLimit,
  onPractice,
}) => {
  return (
    <div className='space-y-6'>
      {/* Thông báo */}
      <div className='flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm'>
        <span>📌</span>
        <p>
          Bạn có thể chọn luyện tập từng phần và thiết lập thời gian phù hợp.
        </p>
      </div>

      {/* Chọn Part */}
      <div>
        <h2 className='text-base font-semibold mb-2'>Chọn phần thi</h2>
        <PartSelector
          parts={parts}
          selectedParts={selectedParts}
          togglePart={togglePart}
        />
      </div>

      {/* Chọn thời gian + nút luyện tập */}
      <div className='flex items-center gap-4'>
        <FormControl size='small' className='flex-1'>
          <InputLabel id='timeLimit-label'>Giới hạn thời gian</InputLabel>
          <Select
            labelId='timeLimit-label'
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          >
            <MenuItem value=''>Không giới hạn</MenuItem>
            <MenuItem value='10'>10 phút</MenuItem>
            <MenuItem value='30'>30 phút</MenuItem>
            <MenuItem value='60'>60 phút</MenuItem>
          </Select>
        </FormControl>

        <Button
          onClick={onPractice}
          variant='contained'
          sx={{
            whiteSpace: 'nowrap', // không cho xuống dòng
            borderRadius: '8px',
            px: 3,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: '#2563eb',
            '&:hover': {
              backgroundColor: '#1e40af',
            },
          }}
        >
          Luyện tập
        </Button>
      </div>
    </div>
  );
};

export default PracticeTab;
