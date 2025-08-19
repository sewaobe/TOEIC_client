import { Card, useTheme } from '@mui/material';
import { FC } from 'react';
import { motion } from 'framer-motion';

interface CardBenefitProps {
  title: string;
  description: string;
  image: string;
  height: string;
  leftToRight?: Boolean;
  isOverflow?: Boolean;
}

const MotionCard = motion(Card);

const CardBenefit: FC<CardBenefitProps> = ({
  title,
  description,
  image,
  height,
  leftToRight = true,
  isOverflow = false,
}) => {
  const theme = useTheme();
  return (
    <MotionCard
      className='relative w-full p-12 !rounded-[20px] !shadow-customCard'
      sx={{ color: theme.palette.text.primary, height, overflow: 'visible' }}
      elevation={0}
      whileHover={{
        y: -15,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      }}
    >
      <img
        src={image}
        alt={title}
        className={`absolute object-contain ${
          isOverflow ? '-bottom-4' : 'bottom-4'
        } ${leftToRight ? 'left-6' : 'right-4'}`}
      />

      <div className='absolute top-6 right-4 w-[350px]'>
        <h3 className='text-xl font-semibold'>{title}</h3>
        <p className='text-base mt-1 text-justify'>{description}</p>
      </div>
    </MotionCard>
  );
};

export default CardBenefit;
