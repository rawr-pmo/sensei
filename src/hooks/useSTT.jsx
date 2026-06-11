import { useCallback, useEffect, useRef, useState } from 'react';

export default function useSTT() {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text + ' ';
        } else {
          interimText += text;
        }
      }
      if (finalText) setTranscript((prev) => prev + finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening((wasListening) => {
        if (wasListening) {
          try {
            recognition.start();
            return true;
          } catch {
            return false;
          }
        }
        return false;
      });
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const start = useCallback(() => {
    setError(null);
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        setError(e.message);
      }
    }
  }, [listening]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      setListening(false);
      recognitionRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return { transcript, interimTranscript, listening, supported, error, start, stop, reset };
}