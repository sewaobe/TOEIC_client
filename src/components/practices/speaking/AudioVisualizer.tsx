import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
    analyser: AnalyserNode | null;
    isRecording: boolean;
}

const AudioVisualizer: React.FC<Props> = ({ analyser, isRecording }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const dataHistoryRef = useRef<number[]>([]);

    useEffect(() => {
        if (!isRecording) {
            dataHistoryRef.current = [];
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const barWidth = 3;
        const barGap = 2;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const draw = () => {
            if (!analyser) return;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            const range = Math.floor(bufferLength / 2);
            for (let i = 0; i < range; i++) {
                sum += dataArray[i];
            }
            const average = sum / range;

            const normalizedVal = Math.min(average * 1.5, 255);
            dataHistoryRef.current.push(normalizedVal);

            const maxBars = Math.ceil(rect.width / (barWidth + barGap));
            if (dataHistoryRef.current.length > maxBars) {
                dataHistoryRef.current.shift();
            }

            ctx.clearRect(0, 0, rect.width, rect.height);
            const centerY = rect.height / 2;
            ctx.fillStyle = '#6366f1';
            ctx.lineCap = 'round';

            for (let i = 0; i < dataHistoryRef.current.length; i++) {
                const val = dataHistoryRef.current[i];
                const barHeight = (val / 255) * rect.height * 0.8;
                const x = i * (barWidth + barGap);

                ctx.beginPath();
                ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 5);
                ctx.fill();
            }

            ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
            ctx.fillRect(0, centerY - 0.5, rect.width, 1);

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyser, isRecording]);

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', bgcolor: '#f8fafc', borderRadius: 4 }}>
            {!isRecording && (
                <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant="caption" color="text.secondary">
                        Waveform will appear here
                    </Typography>
                </Box>
            )}
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
            />
        </Box>
    );
};

export default AudioVisualizer;