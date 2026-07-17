import { useRef, useEffect } from 'react';

interface PitchInteractiveCanvasProps {
  onGoalScored: () => void;
}

export const PitchInteractiveCanvas = ({ onGoalScored }: PitchInteractiveCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Attach pointer listeners to the canvas's parent (the clickable button)
    // so that a plain tap starts the game while dragging still moves the ball.
    const surface = canvas.parentElement ?? canvas;
    
    let animationFrameId: number;
    let hasScored = false;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const ball = {
      x: canvas.width / 2,
      y: canvas.height - 150,
      radius: 35,
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      vx: 0,
      vy: 0,
      rotation: 0
    };

    const mouse = { x: -1000, y: -1000 };

    const getMousePos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top
      };
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (hasScored) return;
      const pos = getMousePos(e);
      const dx = pos.x - ball.x;
      const dy = pos.y - ball.y;
      
      if (Math.sqrt(dx * dx + dy * dy) < ball.radius * 1.5) {
        ball.isDragging = true;
        ball.dragOffsetX = dx;
        ball.dragOffsetY = dy;
        ball.vx = 0;
        ball.vy = 0;
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const pos = getMousePos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;

      if (ball.isDragging && !hasScored) {
        const prevX = ball.x;
        const prevY = ball.y;
        
        ball.x = pos.x - ball.dragOffsetX;
        ball.y = pos.y - ball.dragOffsetY;
        
        // Calculate velocity based on drag speed for when released
        ball.vx = ball.x - prevX;
        ball.vy = ball.y - prevY;
        ball.rotation += ball.vx * 0.05;
      }
    };

    const handlePointerUp = () => {
      ball.isDragging = false;
    };

    surface.addEventListener('mousedown', handlePointerDown);
    surface.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    surface.addEventListener('touchstart', handlePointerDown, { passive: false });
    surface.addEventListener('touchmove', (e) => { e.preventDefault(); handlePointerMove(e); }, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    const drawGlowingNet = () => {
      const width = Math.min(400, canvas.width * 0.8);
      const height = 120;
      const startX = canvas.width / 2 - width / 2;
      const topY = 60;
      
      ctx.save();
      
      // Neon glow effect for posts
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      
      // Goal posts and crossbar
      ctx.beginPath();
      ctx.moveTo(startX, topY + height);
      ctx.lineTo(startX, topY);
      ctx.lineTo(startX + width, topY);
      ctx.lineTo(startX + width, topY + height);
      ctx.stroke();

      // Net grid
      ctx.shadowBlur = 5;
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 20; i < width; i += 20) {
        ctx.moveTo(startX + i, topY);
        ctx.lineTo(startX + i, topY + height);
      }
      for (let i = 20; i < height; i += 20) {
        ctx.moveTo(startX, topY + i);
        ctx.lineTo(startX + width, topY + i);
      }
      ctx.stroke();
      
      ctx.restore();

      return { startX, width, topY, height };
    };

    const drawCinematicBall = (x: number, y: number, r: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Glow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 10;
      
      // Base White Sphere
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      
      // FIFA style geometric patterns
      ctx.shadowBlur = 0;
      
      // Pattern 1: Blue/Teal panels
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.5);
      ctx.lineTo(-r * 0.2, -r * 0.8);
      ctx.lineTo(r * 0.3, -r * 0.6);
      ctx.lineTo(r * 0.1, -r * 0.2);
      ctx.fill();
      
      // Pattern 2: Gold/Orange panels
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(r * 0.2, r * 0.2);
      ctx.lineTo(r * 0.6, r * 0.3);
      ctx.lineTo(r * 0.7, r * 0.7);
      ctx.lineTo(r * 0.3, r * 0.8);
      ctx.fill();
      
      // Pattern 3: Crimson/Red accents
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, r * 0.1);
      ctx.lineTo(-r * 0.8, r * 0.4);
      ctx.lineTo(-r * 0.4, r * 0.7);
      ctx.lineTo(-r * 0.2, r * 0.3);
      ctx.fill();

      // Bold seam lines (Hexagons/Pentagons abstract mix)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2); // Outer border
      
      // Connect panels with seams
      ctx.moveTo(-r * 0.5, -r * 0.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(r * 0.2, r * 0.2);
      
      ctx.moveTo(0, 0);
      ctx.lineTo(-r * 0.2, r * 0.3);
      
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 0.1, -r * 0.2);
      
      ctx.stroke();

      // Inner shadow for 3D sphere look overlay
      const gradient = ctx.createRadialGradient(-r/3, -r/3, r/10, 0, 0, r);
      gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const renderLoop = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const net = drawGlowingNet();

      if (!ball.isDragging && !hasScored) {
        // Friction and drift
        ball.vx *= 0.95;
        ball.vy *= 0.95;
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.rotation += ball.vx * 0.05;

        // Return to center bottom if idle
        if (Math.abs(ball.vx) < 0.1 && Math.abs(ball.vy) < 0.1) {
          const targetX = canvas.width / 2;
          const targetY = canvas.height - 150;
          ball.x += (targetX - ball.x) * 0.02;
          ball.y += (targetY - ball.y) * 0.02;
        }
      }

      // Check for goal
      if (!hasScored && ball.y < net.topY + net.height && ball.x > net.startX && ball.x < net.startX + net.width) {
        hasScored = true;
        ball.isDragging = false;
        
        // Suck ball into the net center
        ball.vx = (canvas.width / 2 - ball.x) * 0.1;
        ball.vy = (net.topY + net.height / 2 - ball.y) * 0.1;
        
        setTimeout(() => {
          onGoalScored();
        }, 800);
      }

      if (hasScored) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.9;
        ball.vy *= 0.9;
        ball.radius = Math.max(10, ball.radius * 0.92); // shrink to look like it went in
        
        // Goal text
        ctx.save();
        ctx.fillStyle = '#34d399';
        ctx.font = '900 60px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 30;
        ctx.fillText('GOAL!', canvas.width / 2, net.topY + net.height / 2 + 20);
        ctx.restore();
      }

      drawCinematicBall(ball.x, ball.y, ball.radius, ball.rotation);
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      surface.removeEventListener('mousedown', handlePointerDown);
      surface.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      surface.removeEventListener('touchstart', handlePointerDown);
      surface.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [onGoalScored]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-20 pointer-events-none touch-none"
    />
  );
};
