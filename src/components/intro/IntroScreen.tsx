import React, { useState } from 'react';
import '../../styles/intro.css';

interface IntroScreenProps {
  onEnter: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isExited, setIsExited] = useState<boolean>(false);

  const handleEnter = () => {
    if (isFading) return;
    setIsFading(true);
    // Notify parent immediately or after start of fade
    onEnter();
    // After CSS transition completes (1200ms), remove from DOM/visibility
    setTimeout(() => {
      setIsExited(true);
    }, 1200);
  };

  if (isExited) {
    return null;
  }

  return (
    <div
      className={`intro-container ${isFading ? 'fade-out' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome screen"
    >
      <div className="intro-decorations" aria-hidden="true">
        <div className="floating-bubble b1" />
        <div className="floating-bubble b2" />
        <div className="floating-bubble b3" />
      </div>

      <div className="intro-content">
        <div className="intro-badge">
          <span className="intro-badge-dot" />
          <span>Chapter 1 &bull; Safe Haven</span>
        </div>

        <h1 className="intro-title">Our Little World</h1>
        <p className="intro-description">A tiny room, a thousand memories.</p>

        <button
          type="button"
          className="intro-btn"
          onClick={handleEnter}
          aria-label="Enter our world"
        >
          ENTER OUR WORLD
        </button>

        <p className="intro-footer" aria-hidden="true">
          Click to step inside our cozy corner
        </p>
      </div>
    </div>
  );
};

export default IntroScreen;
