'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  animationDelay: number;
  movementPath: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
    x4: number;
    y4: number;
    x5: number;
    y5: number;
    x6: number;
    y6: number;
    x7: number;
    y7: number;
  };
  scales: {
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
    s6: number;
    s7: number;
  };
  rotations: {
    r1: number;
    r2: number;
    r3: number;
    r4: number;
    r5: number;
    r6: number;
    r7: number;
    r8: number;
  };
  opacity: number;
  glow: number;
}

export default function AnimatedStars() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const starArray: Star[] = [];
      const numberOfStars = 200;

      for (let i = 0; i < numberOfStars; i++) {
        const x = Math.random() * 120 - 10;
        const y = Math.random() * 120 - 10;

        const movementPath = {
          x1: x + (Math.random() - 0.5) * 40,
          y1: y + (Math.random() - 0.5) * 40,
          x2: x + (Math.random() - 0.5) * 80,
          y2: y + (Math.random() - 0.5) * 80,
          x3: x + (Math.random() - 0.5) * 120,
          y3: y + (Math.random() - 0.5) * 120,
          x4: x + (Math.random() - 0.5) * 160,
          y4: y + (Math.random() - 0.5) * 160,
          x5: x + (Math.random() - 0.5) * 200,
          y5: y + (Math.random() - 0.5) * 200,
          x6: x + (Math.random() - 0.5) * 240,
          y6: y + (Math.random() - 0.5) * 240,
          x7: x + (Math.random() - 0.5) * 280,
          y7: y + (Math.random() - 0.5) * 280,
        };

        const scales = {
          s1: Math.random() * 0.8 + 0.3,
          s2: Math.random() * 1.2 + 0.4,
          s3: Math.random() * 0.9 + 0.2,
          s4: Math.random() * 1.3 + 0.3,
          s5: Math.random() * 0.7 + 0.2,
          s6: Math.random() * 0.5 + 0.1,
          s7: Math.random() * 0.3 + 0.05,
        };

        const rotations = {
          r1: Math.random() * 360,
          r2: Math.random() * 360,
          r3: Math.random() * 360,
          r4: Math.random() * 360,
          r5: Math.random() * 360,
          r6: Math.random() * 360,
          r7: Math.random() * 360,
          r8: Math.random() * 360,
        };

        const opacity = 0.6 + Math.random() * 0.4;
        const glow = 0.2 + Math.random() * 0.6;

        starArray.push({
          id: i,
          x,
          y,
          size: Math.random() * 3 + 0.5,
          animationDelay: Math.random() * 30,
          movementPath,
          scales,
          rotations,
          opacity,
          glow,
        });
      }

      setStars(starArray);
    };
    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => {
        const starId = `star-${star.id}`;

        return (
          <div key={star.id}>
            <style jsx>{`
              @keyframes ${starId}-chaos {
                0% {
                  transform: translate(${star.x}%, ${star.y}%) scale(${star.scales.s1}) rotate(${star.rotations.r1}deg);
                  opacity: 0;
                }
                12% {
                  transform: translate(${star.movementPath.x1}%, ${star.movementPath.y1}%) scale(${star.scales.s2}) rotate(${star.rotations.r2}deg);
                  opacity: ${star.opacity};
                }
                25% {
                  transform: translate(${star.movementPath.x2}%, ${star.movementPath.y2}%) scale(${star.scales.s3}) rotate(${star.rotations.r3}deg);
                  opacity: 0.9;
                }
                38% {
                  transform: translate(${star.movementPath.x3}%, ${star.movementPath.y3}%) scale(${star.scales.s4}) rotate(${star.rotations.r4}deg);
                  opacity: ${star.opacity};
                }
                50% {
                  transform: translate(${star.movementPath.x4}%, ${star.movementPath.y4}%) scale(${star.scales.s5}) rotate(${star.rotations.r5}deg);
                  opacity: 0.8;
                }
                75% {
                  transform: translate(${star.movementPath.x5}%, ${star.movementPath.y5}%) scale(${star.scales.s6}) rotate(${star.rotations.r6}deg);
                  opacity: 0.5;
                }
                88% {
                  transform: translate(${star.movementPath.x6}%, ${star.movementPath.y6}%) scale(${star.scales.s7}) rotate(${star.rotations.r7}deg);
                  opacity: 0.2;
                }
                100% {
                  transform: translate(${star.movementPath.x7}%, ${star.movementPath.y7}%) scale(0.05) rotate(${star.rotations.r8}deg);
                  opacity: 0;
                }
              }

              .${starId}-animate {
                animation: ${starId}-chaos 20s ease-in-out infinite;
              }
            `}</style>

            <div
              className={`absolute ${starId}-animate`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: `rgba(255, 255, 255, ${star.opacity})`,
                borderRadius: '50%',
                boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, ${star.glow})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
