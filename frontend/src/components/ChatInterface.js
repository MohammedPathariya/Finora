// src/components/ChatInterface.js
import React, { useState, useRef, useEffect } from "react";

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const { reply } = await res.json();
      const assistantMsg = { role: "assistant", content: reply };
      setMessages((msgs) => [...msgs, assistantMsg]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="max-w-3xl mx-auto mt-8 font-serif">
      <h2 className="text-2xl mb-4 text-gray-800">Chat with Finora</h2>
      <div className="bg-white border border-gray-200 rounded-2xl p-4 h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex mb-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>            
            <div className={`px-4 py-2 rounded-xl max-w-xs ${m.role === "user" ? "bg-emerald-100 text-gray-800" : "bg-gray-100 text-gray-800"}`}>{m.content}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex mt-3">
        <input
          className="flex-1 border border-gray-300 rounded-xl p-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your question..."
        />
        <button onClick={sendMessage} className="ml-2 bg-emerald-800 text-white px-4 rounded-xl hover:bg-emerald-700 transition">Send</button>
      </div>
    </section>
}