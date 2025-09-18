import { useState, useRef, useEffect } from "react";
import styles from "../styles/ChatPremium.module.css";
import { FiSend } from "react-icons/fi";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    inputRef.current.focus();
    setIsTyping(true);

    // Add empty assistant message for UI
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      // Filter out empty assistant messages for API
      const realMessages = [...messages, userMessage].filter(
        (m) => m.role !== "assistant" || m.content.trim() !== ""
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: realMessages }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantIndex].content = assistantContent;
          return newMessages;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[assistantIndex].content = "Error: Could not get response.";
        return newMessages;
      });
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatWindow}>
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${
                msg.role === "user" ? styles.user : styles.assistant
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.message} ${styles.assistant} ${styles.typing}`}>
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputBox}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
