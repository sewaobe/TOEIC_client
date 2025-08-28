import { Alert } from '@mui/material';

export default function AlertBox() {
  return (
    <Alert severity='warning' variant='outlined' className='mb-6'>
      Chú ý: bạn được học tối đa 20 từ mới mỗi ngày. Đây là lượng từ phù hợp để
      bạn có thể học hiệu quả.
    </Alert>
  );
}
