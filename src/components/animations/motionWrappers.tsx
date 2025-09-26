import { motion } from 'framer-motion';

export const FadeUp = (props: any) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    viewport={{ once: true }}
    {...props}
  />
);

export const SlideLeft = (props: any) => (
  <motion.div
    initial={{ opacity: 0, x: -60 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    viewport={{ once: true }}
    {...props}
  />
);

export const SlideRight = (props: any) => (
  <motion.div
    initial={{ opacity: 0, x: 60 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    viewport={{ once: true }}
    {...props}
  />
);

// Lắc nhẹ khi mount
export const Shake = (props: any) => (
  <motion.div
    initial={{ x: 0 }}
    animate={{ x: [0, -6, 6, -3, 3, 0] }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    {...props}
  />
);

// Nhịp đập nhẹ liên tục
export const Pulse = (props: any) => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    {...props}
  />
);
