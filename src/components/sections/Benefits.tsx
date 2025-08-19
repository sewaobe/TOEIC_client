import { FC } from 'react';
import { Box, Typography, Card } from '@mui/material';
import { Benefit } from '../../models/Benefit';
import CardBenefit from '../cards/CardBenefit';
import { FadeUp, SlideLeft, SlideRight } from '../animations/motionWrappers';

interface BenefitsProps {
  benefits: Benefit[];
}

const Benefits: FC<BenefitsProps> = ({ benefits }) => {
  return (
    <Box component='section' className='relative py-20 overflow-hidden'>
      <FadeUp>
        <Typography variant='h4' align='center' gutterBottom fontWeight='bold'>
          Tại Sao Chọn TOEIC Master?
        </Typography>
        <Card
          className='relative w-full p-12 !rounded-[15px] !shadow-customCard h-[180px] mt-8'
          sx={{ overflow: 'visible' }}
          elevation={0}
        >
          <img
            src={benefits[0].image}
            alt={benefits[0].title}
            className={`absolute object-contain bottom-0 right-[5%]`}
          />

          <div className='absolute top-6 left-8 w-[600px]'>
            <h3 className='text-xl font-semibold'>{benefits[0].title}</h3>
            <p className='text-base mt-1 text-justify'>
              {benefits[0].description}
            </p>
          </div>
        </Card>
      </FadeUp>

      <div className='relative mt-8 flex w-full gap-6'>
        {/* Background mờ mờ */}
        <div
          className='absolute top-1/2 left-1/2 w-[766px] h-[80%] -translate-x-1/2 -translate-y-1/2 z-0'
          style={{
            background:
              'radial-gradient(40% 60% at 50% 50%, #fae9e4 0, hsla(13,75%,94%,.775) 10%, hsla(0,0%,100%,0) 100%)',
          }}
        />
        <div className='w-3/5 flex flex-col gap-6'>
          <SlideLeft>
            <CardBenefit
              key={benefits[1].id}
              title={benefits[1].title}
              description={benefits[1].description}
              image={benefits[1].image}
              height='396px'
            />
          </SlideLeft>
          <SlideLeft>
            <CardBenefit
              key={benefits[3].id}
              title={benefits[3].title}
              description={benefits[3].description}
              image={benefits[3].image}
              height='446px'
              isOverflow={true}
            />
          </SlideLeft>
        </div>
        <div className=' w-2/5 flex flex-col gap-6'>
          <SlideRight>
            <CardBenefit
              key={benefits[2].id}
              title={benefits[2].title}
              description={benefits[2].description}
              image={benefits[2].image}
              height='497px'
              leftToRight={false}
            />
          </SlideRight>

          <SlideRight>
            <CardBenefit
              key={benefits[4].id}
              title={benefits[4].title}
              description={benefits[4].description}
              image={benefits[4].image}
              height='345px'
              leftToRight={false}
              isOverflow={true}
            />
          </SlideRight>
        </div>
      </div>
    </Box>
  );
};

export default Benefits;
