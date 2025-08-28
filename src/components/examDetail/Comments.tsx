import { Button, TextField, Avatar } from '@mui/material';
import { forwardRef } from 'react';

const Comments = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className='p-6'>
      <h2 className='font-semibold text-lg mb-4'>Bình luận</h2>

      {/* Form nhập bình luận */}
      <div className='flex gap-3 mb-5'>
        <Avatar sx={{ bgcolor: '#1976d2' }}>U</Avatar>
        <TextField
          placeholder='Chia sẻ cảm nghĩ của bạn...'
          multiline
          rows={3}
          fullWidth
        />
      </div>
      <div className='flex justify-end mb-6'>
        <Button variant='contained' color='primary'>
          Gửi
        </Button>
      </div>

      {/* Danh sách bình luận */}
      <div className='space-y-4'>
        <div className='flex gap-3'>
          <Avatar sx={{ bgcolor: '#ef5350' }}>A</Avatar>
          <div className='bg-gray-50 p-3 rounded-lg w-full'>
            <p className='font-medium'>
              @user1{' '}
              <span className='text-xs text-gray-500 ml-2'>2 giờ trước</span>
            </p>
            <p className='text-gray-700'>
              Test này rất hữu ích cho việc luyện thi TOEIC.
            </p>
          </div>
        </div>

        <div className='flex gap-3'>
          <Avatar sx={{ bgcolor: '#42a5f5' }}>N</Avatar>
          <div className='bg-gray-50 p-3 rounded-lg w-full'>
            <p className='font-medium'>
              @nguyenbao{' '}
              <span className='text-xs text-gray-500 ml-2'>1 ngày trước</span>
            </p>
            <p className='text-gray-700'>Mình đã đạt 900+ nhờ luyện đề này!</p>
          </div>
        </div>
        <div className='flex gap-3'>
          <Avatar sx={{ bgcolor: '#42a5f5' }}>N</Avatar>
          <div className='bg-gray-50 p-3 rounded-lg w-full'>
            <p className='font-medium'>
              @nguyenbao{' '}
              <span className='text-xs text-gray-500 ml-2'>1 ngày trước</span>
            </p>
            <p className='text-gray-700'>Mình đã đạt 900+ nhờ luyện đề này!</p>
          </div>
        </div>
        <div className='flex gap-3'>
          <Avatar sx={{ bgcolor: '#42a5f5' }}>N</Avatar>
          <div className='bg-gray-50 p-3 rounded-lg w-full'>
            <p className='font-medium'>
              @nguyenbao{' '}
              <span className='text-xs text-gray-500 ml-2'>1 ngày trước</span>
            </p>
            <p className='text-gray-700'>Mình đã đạt 900+ nhờ luyện đề này!</p>
          </div>
        </div>
        <div className='flex gap-3'>
          <Avatar sx={{ bgcolor: '#42a5f5' }}>N</Avatar>
          <div className='bg-gray-50 p-3 rounded-lg w-full'>
            <p className='font-medium'>
              @nguyenbao{' '}
              <span className='text-xs text-gray-500 ml-2'>1 ngày trước</span>
            </p>
            <p className='text-gray-700'>Mình đã đạt 900+ nhờ luyện đề này!</p>
          </div>
        </div>
      </div>
    </div>
  );
});

Comments.displayName = 'Comments';

export default Comments;
