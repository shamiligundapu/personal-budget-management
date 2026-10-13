import { useState } from 'react'
import api from '../api/axios'

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Ask about your spending, budget alerts, or savings progress.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const askAssistant = async () => {
    if (!input.trim()) return

    const userMessage = { sender: 'user', text: input }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await api.post('/ai/chat', { message: input })
      const assistantReply = { sender: 'assistant', text: response.data.reply }
      setMessages((current) => [...current, assistantReply])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <p className="eyebrow">AI support</p>
          <h1>Budget assistant</h1>
        </div>
      </div>

      <div className="panel-card chat-panel">
        <div className="chat-window">
          {messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.sender}`}>
              {message.text}
            </div>
          ))}
          {loading && <div className="chat-message assistant typing">Thinking...</div>}
        </div>

        <div className="chat-input-row">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="How much did I spend this month?" />
          <button className="primary-button" onClick={askAssistant} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  )
}
