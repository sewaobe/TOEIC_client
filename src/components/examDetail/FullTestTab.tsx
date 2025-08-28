import { Button } from '@mui/material';

const FullTestTab: React.FC = () => (
  <div className='p-6 border rounded-lg text-gray-700'>
    <h2 className='text-lg font-semibold mb-2'>Làm Full Test</h2>
    <p>
      Ở chế độ này bạn sẽ làm toàn bộ 200 câu trong 120 phút giống bài thi thật.
    </p>
    <Button variant='contained' color='primary' className='!mt-4'>
      BẮT ĐẦU FULL TEST
    </Button>
  </div>
);

export default FullTestTab;
