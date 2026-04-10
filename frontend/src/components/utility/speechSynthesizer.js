/**
 * Text-to-Speech synthesizer utility
 * Uses 'say' package for Electron, Web Speech API for browser
 */

let sayInstance = null;

// Get say module - only works in Electron with nodeIntegration
const getSay = () => {
  if (sayInstance) return sayInstance;
  
  // Check if we're in Electron with nodeIntegration (has window.require)
  if (typeof window !== 'undefined' && window.require) {
    try {
      sayInstance = window.require('say');
      return sayInstance;
    } catch (err) {
      console.warn('Failed to load say module:', err);
    }
  }
  
  return null;
};

/**
 * Speak text using TTS
 * @param {string} text - The text to speak
 * @param {Object} options - Optional configuration
 * @param {number} options.speed - Speech speed for say (1 to 200, default 175)
 * @param {number} options.rate - Speech rate for browser (0.1 to 10, default 1)
 */
export const speak = (text, options = {}) => {
  // Try say package first (Electron)
  const say = getSay();
  
  if (say) {
    const speed = options.speed || 130;
    say.speak(text, null, speed, (err) => {
      if (err) console.error('Speech error:', err);
    });
    return;
  }
  
  // Fallback to Web Speech API (browser)
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const synth = window.speechSynthesis;
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.75;
    utterance.pitch = options.pitch ?? 3;
    utterance.volume = options.volume ?? 3;
    
    synth.speak(utterance);
  }
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = () => {
  const say = getSay();
  if (say) {
    say.stop();
  } else if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if speech synthesis is available
 * @returns {boolean}
 */
export const isSpeechSupported = () => {
  const hasSay = typeof window !== 'undefined' && window.require;
  const hasWebSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
  return hasSay || hasWebSpeech;
};

export default { speak, stopSpeaking, isSpeechSupported };

