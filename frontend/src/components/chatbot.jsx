import React, { useState, useRef, useEffect } from "react";
import { FaCommentDots, FaPaperPlane } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import "../styles/chatbot.css";

export default function Chatbot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can we help you today?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatBodyRef = useRef(null);

  const toggleChat = () => setChatOpen((prev) => !prev);

  // Scroll to bottom on new message or open
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const now = new Date();
    const userMsg = { from: "user", text: input.trim(), timestamp: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/utils/chatbot/", { message: userMsg.text });

      if (res.data.response) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: res.data.response, timestamp: new Date() },
        ]);
      } else if (res.data.error) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: `Error: ${res.data.error}`, timestamp: new Date() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Sorry, no response from server.", timestamp: new Date() },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, something went wrong.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onEnterPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format time like "10:35 AM"
  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <button
        className={`chatbot-button ${chatOpen ? "open" : ""}`}
        onClick={toggleChat}
        aria-label={chatOpen ? "Close chat" : "Open chat"}
      >
        <FaCommentDots size={24} />
      </button>

      {chatOpen && (
        <div
          className="chatbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbox-title"
        >
          <div className="chatbox-header">
            <h4 id="chatbox-title">Need Travel Help?</h4>
            <button
              className="chatbox-close"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chatbox-body" ref={chatBodyRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-message ${msg.from === "bot" ? "bot" : "user"}`}
                role={msg.from === "bot" ? "alert" : undefined}
                aria-live={msg.from === "bot" ? "polite" : undefined}
              >
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-message bot typing-indicator" aria-live="polite">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
          </div>

          <form
            className="chatbox-input"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onEnterPress}
              placeholder="Type your question..."
              rows={2}
              disabled={loading}
              aria-label="Type your question"
              maxLength={500}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
