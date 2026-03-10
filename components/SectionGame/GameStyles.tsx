export default function GameStyles() {
  return (
    <style global>{`
      @keyframes rivalFade {
        0% { opacity: 0; }
        15% { opacity: 1; }
        85% { opacity: 1; }
        100% { opacity: 0; }
      }

      @keyframes battleCardShake {
        0% { transform: translateX(0px) rotate(0deg); }
        20% { transform: translateX(-4px) rotate(-1deg); }
        40% { transform: translateX(4px) rotate(1deg); }
        60% { transform: translateX(-3px) rotate(-1deg); }
        80% { transform: translateX(3px) rotate(1deg); }
        100% { transform: translateX(0px) rotate(0deg); }
      }

      @keyframes battleCardFlip {
        0% { transform: rotateY(0deg) translateZ(0px); }
        35% { transform: rotateY(-22deg) translateZ(4px); }
        50% { transform: rotateY(-180deg) translateZ(8px); }
        65% { transform: rotateY(-22deg) translateZ(4px); }
        100% { transform: rotateY(0deg) translateZ(0px); }
      }

      .battle-card-container {
        transform-style: preserve-3d;
        backface-visibility: hidden;
        perspective: 1000px;
      }

      .battle-card-shake {
        animation: battleCardShake 180ms ease-in-out 3;
        transform-origin: center;
      }

      .battle-card-flip {
        animation: battleCardFlip 620ms cubic-bezier(0.35, 0, 0.2, 1) forwards;
        transform-origin: center;
      }
    `}</style>
  )
}
