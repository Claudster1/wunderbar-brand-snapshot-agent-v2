'use client'

import { FormEvent, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useBrandChat } from "../src/hooks/useBrandChat";
import WundyLogo from "@/assets/wundy-logo.jpeg";
import "./globals.css";

export default function Home() {
  const { messages, isLoading, sendMessage, reset } = useBrandChat();
  const [inputValue, setInputValue] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-focus input field when ready for next question
  useEffect(() => {
    // Focus input when:
    // 1. Component mounts (initial focus)
    // 2. Loading finishes (after assistant responds)
    // 3. New assistant message arrives
    if (!isLoading && inputRef.current && !inputRef.current.disabled) {
      // Small delay to ensure DOM is ready and scroll completes
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, messages]);

  // Also focus after form submission (when input is cleared)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    await sendMessage(inputValue);
    setInputValue("");
    // Focus input after message is sent and cleared
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

              // Report iframe height to parent window for auto-expanding
              useEffect(() => {
                function reportHeight() {
                  if (typeof window !== 'undefined' && window.parent !== window) {
                    const height = document.documentElement.scrollHeight;
                    // Support both message types for compatibility
                    window.parent.postMessage({ type: "BS_IFRAME_HEIGHT", height }, "*");
                    window.parent.postMessage({ type: "RESIZE_IFRAME", height }, "*");
                  }
                }

                // Report initial height
                reportHeight();

                // Watch for size changes
                const resizeObserver = new ResizeObserver(() => {
                  reportHeight();
                });

                resizeObserver.observe(document.body);

                // Also report on messages/loading changes
                const timeoutId = setTimeout(reportHeight, 100);

                return () => {
                  resizeObserver.disconnect();
                  clearTimeout(timeoutId);
                };
              }, [messages, isLoading]);

  const handleReset = () => {
    reset();
    setInputValue("");
    setSelectedOptions([]);
  };

  // Parse multi-select options from assistant message
  const parseMultiSelectOptions = (text: string): string[] | null => {
    // Check if message contains "select multiple" or similar indicators
    const isMultiSelect = /select multiple|you can select|multiple options/i.test(text);
    if (!isMultiSelect) return null;

    // Extract options (lines starting with - or •)
    const lines = text.split('\n');
    const options: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match lines starting with - or • followed by text
      const match = trimmed.match(/^[-•]\s*(.+)$/);
      if (match) {
        options.push(match[1].trim());
      }
    }

    return options.length > 0 ? options : null;
  };

  // Get the last assistant message to check for multi-select
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
  const multiSelectOptions = lastAssistantMessage 
    ? parseMultiSelectOptions(lastAssistantMessage.text)
    : null;

  // Handle checkbox toggle
  const handleCheckboxToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  // Handle submit with checkboxes
  const handleSubmitWithOptions = async () => {
    if (selectedOptions.length === 0) return;
    const response = selectedOptions.join(', ');
    await sendMessage(response);
    setSelectedOptions([]);
    setInputValue("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="app-root">
      <div className="app-shell">
        <section className="app-card" aria-labelledby="wundy-heading">
          <header className="app-card-header">
            <div className="app-card-avatar-wrap">
              <Image
                src={WundyLogo}
                alt="Wundy, brand specialist"
                className="app-card-avatar"
                width={64}
                height={64}
              />
            </div>

            <div>
              <div className="app-card-eyebrow">BRAND SNAPSHOT™</div>
            </div>
          </header>

          <div className="app-body">
            <div className="chat-panel">
              <div className="chat-messages" aria-live="polite">
                {messages.map((message) => {
                  // Check if this is a multi-select question
                  const options = message.role === 'assistant' 
                    ? parseMultiSelectOptions(message.text)
                    : null;
                  
                  if (options && options.length > 0) {
                    // Render message with checkboxes
                    const questionText = message.text.split('\n').find(line => 
                      !line.trim().match(/^[-•]\s/)
                    ) || message.text.split('\n')[0];
                    
                    return (
                      <div
                        key={message.id}
                        className={`chat-bubble chat-bubble-${message.role}`}
                      >
                        <p>{questionText}</p>
                        <div className="chat-checkboxes">
                          {options.map((option, idx) => (
                            <label key={idx} className="chat-checkbox-label">
                              <input
                                type="checkbox"
                                checked={selectedOptions.includes(option)}
                                onChange={() => handleCheckboxToggle(option)}
                                disabled={isLoading}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  // Regular message rendering
                  return (
                    <div
                      key={message.id}
                      className={`chat-bubble chat-bubble-${message.role}`}
                    >
                      {message.text.split("\n\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="chat-bubble chat-bubble-assistant pending">
                    Wundy is thinking…
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {multiSelectOptions && multiSelectOptions.length > 0 ? (
                // Show submit button for checkboxes
                <div className="chat-input-row">
                  <button
                    type="button"
                    className="chat-send"
                    onClick={handleSubmitWithOptions}
                    disabled={isLoading || selectedOptions.length === 0}
                  >
                    {isLoading ? "Sending…" : "Continue"}
                  </button>
                  <button
                    type="button"
                    className="chat-reset"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Start over
                  </button>
                </div>
              ) : (
                // Regular text input form
                <form className="chat-input-row" onSubmit={handleSubmit}>
                  <label htmlFor="brand-message" className="sr-only">
                    Send a message to Wundy
                  </label>
                  <input
                    ref={inputRef}
                    id="brand-message"
                    name="brand-message"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder="Type your reply…"
                    disabled={isLoading}
                    autoFocus
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
              )}
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

