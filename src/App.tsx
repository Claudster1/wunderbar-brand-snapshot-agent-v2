import React, { useEffect, useRef, useState, FormEvent } from "react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const QUESTIONS: string[] = [
  "To start, in a sentence or two, how would you describe what your business does and who you serve?",
  "Next, tell me a bit about where your brand is showing up today (website, social channels, email, etc.) and which ones feel most important for growth.",
  "How would you describe your brand’s personality and tone of voice? Are there any brands you admire or want to be different from?",
  "When someone discovers you for the first time, what do you want them to understand quickly about your offer and why it matters?",
  "Looking ahead 6–12 months, what would ‘success’ look like for your brand? What would need to be true for you to feel like your marketing is working?"
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Seed Wundy’s intro + first question on first load
  useEffect(() => {
    if (messages.length > 0) return;

    const intro =
      "Hi, I’m Wundy, your brand strategy assistant. I’ll ask a few quick questions so we can understand how your brand is showing up right now.";
    const firstQuestion = QUESTIONS[0];

    setMessages([
      {
        id: "assistant-0",
        role: "assistant",
        content: `${intro}\n\n${firstQuestion}`
      }
    ]);
    setQuestionIndex(1);
  }, [messages.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim()
    };

    setIsSubmitting(true);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate Wundy moving to the next question (no LLM call yet)
    setTimeout(() => {
      setMessages((prev) => {
        const nextMessages = [...prev];

        if (questionIndex < QUESTIONS.length) {
          const nextQuestion = QUESTIONS[questionIndex];
          nextMessages.push({
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: nextQuestion
          });
          setQuestionIndex(questionIndex + 1);
        } else {
          // End of sequence
          nextMessages.push({
            id: `assistant-complete-${Date.now()}`,
            role: "assistant",
            content:
              "Thank you — that gives a solid picture of how your brand is showing up today. When you’re ready, you can request your complete Brand Snapshot™ to see your score and recommendations."
          });
        }

        return nextMessages;
      });

      setIsSubmitting(false);
    }, 300); // small delay so it feels responsive but not instant
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "40px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E8F2FF" // light blue similar to Brand Snapshot LP
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 24px 70px rgba(2, 24, 89, 0.20)",
          border: "1px solid #E0E3EA",
          padding: 24,
          boxSizing: "border-box",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif'
        }}
      >
        {/* Top description line (no header) */}
        <p
          style={{
            margin: 0,
            marginBottom: 16,
            fontSize: 14,
            lineHeight: 1.6,
            color: "#021859"
          }}
        >
          <strong>
            Answer a few quick questions so we can get a clear picture of how
            your brand is showing up today.
          </strong>
        </p>

        {/* Chat panel */}
        <div
          style={{
            marginTop: 8,
            marginBottom: 16,
            borderRadius: 18,
            border: "1px solid #D3E0F5",
            backgroundColor: "#E8F2FF", // light blue in place of gray
            padding: 16,
            maxHeight: 480,
            overflowY: "auto",
            boxSizing: "border-box"
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: 16,
                    fontSize: 15,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    color: "#000000",
                    backgroundColor: isUser ? "#FFFFFF" : "#D5E7FF",
                    border: isUser ? "1px solid #C9D6EB" : "none",
                    boxShadow: isUser
                      ? "0 6px 18px rgba(2, 24, 89, 0.15)"
                      : "none"
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input + button */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer here and press Enter to send. Shift+Enter for a new line."
              style={{
                flex: 1,
                resize: "none",
                minHeight: 52,
                maxHeight: 104,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #CBD5F0",
                fontSize: 15,
                lineHeight: 1.5,
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                color: "#000000",
                outline: "none"
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as FormEvent);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSubmitting}
              style={{
                flexShrink: 0,
                padding: "0 20px",
                height: 44,
                borderRadius: 5,
                border: "none",
                fontSize: 15,
                fontWeight: 500,
                cursor:
                  !input.trim() || isSubmitting ? "not-allowed" : "pointer",
                backgroundColor:
                  !input.trim() || isSubmitting ? "#9AD7F5" : "#07B0F2",
                color: "#FFFFFF",
                boxShadow:
                  !input.trim() || isSubmitting
                    ? "none"
                    : "0 8px 24px rgba(7, 176, 242, 0.45)",
                transition: "background-color 0.15s ease, box-shadow 0.15s ease"
              }}
              onMouseDown={(e) => {
                // remove focus outline on click
                e.currentTarget.blur();
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;

