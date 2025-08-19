import { FC } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme,
} from '@mui/material';
import { Feature } from '../../models/Feature';
import { motion } from 'framer-motion';

interface FeaturesProps {
  features: Feature[];
}

// Container variants để tạo hiệu ứng xuất hiện nối đuôi nhau
const containerVariants = {
  offscreen: { opacity: 0 },
  onscreen: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Mỗi card sẽ xuất hiện cách nhau 0.15s
    },
  },
};

// Card variants với hiệu ứng tinh tế hơn
const cardVariants = {
  offscreen: { y: 50, x: -30, opacity: 0 },
  onscreen: {
    y: 0,
    x: 0,
    opacity: 1,
    transition: { type: 'spring', bounce: 0.4, duration: 0.8 },
  },
} as const;

const Features: FC<FeaturesProps> = ({ features }) => {
  const theme = useTheme();

  return (
    <Box
      component='section'
      sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, sm: 4 } }}
    >
      <Typography variant='h3' align='center' fontWeight='700' gutterBottom>
        Tính năng nổi bật
      </Typography>

      <motion.div
        initial='offscreen'
        whileInView='onscreen'
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <Grid
          container
          spacing={{ xs: 3, sm: 4 }}
          sx={{ mt: { xs: 6, md: 8 }, justifyContent: 'center' }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Grid key={f.id} size={{ xs: 12, sm: 6 }}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.03 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '16px',
                      border: `1px solid ${theme.palette.divider}`,
                      transition:
                        'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      '&:hover': {
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        {/* Icon được làm nổi bật */}
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1,
                            ),
                          }}
                        >
                          <Icon
                            sx={{ fontSize: '2rem', color: 'primary.main' }}
                          />
                        </Box>

                        <Box>
                          <Typography variant='h6' fontWeight='600'>
                            {f.title}
                          </Typography>
                          <Typography
                            variant='body1'
                            mt={1}
                            color='text.secondary'
                          >
                            {f.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default Features;
