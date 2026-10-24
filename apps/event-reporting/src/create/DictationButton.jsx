import { useEffect, useRef, useState } from 'react';
import Icon from '../shell/Icon.jsx';

// The browser's built-in speech recognition (Chrome and Edge), if any.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Turns speech into text for the description (FR-006). Each finished sentence is passed to onText.
export default function DictationButton({ onText }) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const recognitionRef = useRef(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  // Stop listening when the form is left.
  useEffect(() => () => recognitionRef.current?.stop(), []);

  function start() {
    if (!SpeechRecognition) {
      setMessage('Dictation is not available in this browser. Type the description instead.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const text = [...e.results]
        .slice(e.resultIndex)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .join(' ');
      if (text) onTextRef.current(text);
    };
    recognition.onerror = (e) => {
      setMessage(e.error === 'not-allowed' ? 'Allow microphone access to dictate.' : 'Dictation stopped.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setMessage('');
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
    <>
      <button
        type="button"
        className={`attachment-button dictation-button${listening ? ' dictation-button--on' : ''}`}
        aria-pressed={listening}
        onClick={listening ? stop : start}
      >
        <Icon name="mic" size={18} /> {listening ? 'Stop dictation' : 'Dictate'}
      </button>
      {message && (
        <span className="field-hint dictation-message" role="status">
          {message}
        </span>
      )}
    </>
  );
}
