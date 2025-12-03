'use client'

import { FormEvent, useState, useEffect, useRef } from "react";
import { useBrandChat } from "../src/hooks/useBrandChat";
import "./globals.css";

export default function Home() {
  const { messages, isLoading, sendMessage, reset } = useBrandChat();
  const [inputValue, setInputValue] = useState("");
  const [progress, setProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return prev; // Slow down near the end
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 300);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [messages, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    await sendMessage(inputValue);
    setInputValue("");
  };

  const handleReset = () => {
    reset();
    setInputValue("");
  };

  return (
    <div className="app-root">
      <div className="app-shell">
        <section className="app-card" aria-labelledby="wundy-heading">
          <header className="app-card-header">
            <div className="app-card-avatar-wrap">
              <img
                src="/assets/wundy-logo.jpeg"
                alt="Wundy, brand specialist"
                className="app-card-avatar"
              />
            </div>

            <div>
              <div className="app-card-eyebrow">BRAND SNAPSHOT™</div>
            </div>
          </header>

          <div className="app-body">
            <div className="chat-panel">
              <div className="chat-messages" aria-live="polite">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-bubble chat-bubble-${message.role}`}
                  >
                    {message.text.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-bubble chat-bubble-assistant pending">
                    Wundy is thinking…
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-row" onSubmit={handleSubmit}>
                <label htmlFor="brand-message" className="sr-only">
                  Send a message to Wundy
                </label>
                <input
                  id="brand-message"
                  name="brand-message"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Type your reply…"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="chat-send"
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? "Sending…" : "Send"}
                </button>
                <button
                  type="button"
                  className="chat-reset"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Start over
                </button>
              </form>
            </div>
            {isLoading && (
              <div className="app-loading-status">
                <div className="app-progress-bar">
                  <div
                    className="app-progress-fill"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="app-card-footer">
                  Wundy is preparing your personalized questions and will be ready in a moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

