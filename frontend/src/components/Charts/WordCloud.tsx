import { useEffect, useRef } from 'react';
import { WordCloudData } from '../../services/api';
import './WordCloud.css';

interface WordCloudProps {
  data: WordCloudData[];
  questionText: string;
}

export default function WordCloud({ data, questionText }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));

    // Center point
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Sort by value (descending) - larger values go to center
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // Calculate positions using a spiral layout with larger values closer to center
    sortedData.forEach((item, index) => {
      const normalizedValue = (item.value - minValue) / (maxValue - minValue || 1);
      const fontSize = Math.max(16, 16 + normalizedValue * 40); // Font size between 16-56
      
      // Position: larger values closer to center
      const distanceFromCenter = (1 - normalizedValue) * Math.min(centerX, centerY) * 0.7;
      const angle = (index * 137.5) % 360; // Golden angle for even distribution
      const radian = (angle * Math.PI) / 180;
      
      const x = centerX + Math.cos(radian) * distanceFromCenter;
      const y = centerY + Math.sin(radian) * distanceFromCenter;

      // Measure text
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgba(52, 152, 219, ${0.5 + normalizedValue * 0.5})`; // Opacity based on value
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw text
      ctx.fillText(item.text, x, y);
    });
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="wordcloud-container">
        <h3>{questionText}</h3>
        <p className="no-data">No answers yet</p>
      </div>
    );
  }

  return (
    <div className="wordcloud-container">
      <h3>{questionText}</h3>
      <div className="wordcloud-wrapper">
        <canvas ref={canvasRef} className="wordcloud-canvas" />
      </div>
      <div className="wordcloud-legend">
        <p>Word size indicates frequency. Larger words appear more frequently.</p>
        <div className="wordcloud-stats">
          <span>Total unique groups: {data.length}</span>
          <span>Most frequent: {data[0]?.text} ({data[0]?.value} times)</span>
        </div>
      </div>
    </div>
  );
}

