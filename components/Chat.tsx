'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change or during streaming
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // Add an initial assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      let accumulatedContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk and accumulate it
        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk

        // Update the last assistant message with the accumulated content
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage.role === 'assistant') {
            lastMessage.content = accumulatedContent
          }
          return newMessages
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="relative w-full max-w-[90%] xl:max-w-[80%] 2xl:max-w-[70%] h-[90vh] flex flex-col rounded-xl glass-morphism shadow-2xl">
      {/* Header */}
      <div className="absolute inset-x-0 top-0 h-24 rounded-t-xl glass-morphism-light">
        <div className="flex h-full items-center justify-center px-6">
          <Bot className="mr-3 h-8 w-8 text-blue-400" />
          <h1 className="text-2xl font-semibold text-gray-100">DeepClaude Chat</h1>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea 
        className="custom-scrollbar flex-1 pt-28 pb-4" 
        ref={scrollAreaRef}
      >
        <div className="space-y-8 px-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              className={`flex items-start space-x-3 message-appear ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Bot className="h-6 w-6 text-blue-400" />
                </div>
              )}
              <div
                className={`
                  relative max-w-[85%] rounded-2xl p-5 shadow-lg
                  ${msg.role === 'user' 
                    ? 'glass-morphism-light bg-blue-600/20' 
                    : 'glass-morphism bg-gray-800/30'
                  }
                `}
              >
                <div className="relative">
                  <div className="mb-2 text-sm text-gray-400">
                    {msg.role === 'user' ? 'You' : 'DeepClaude'}
                  </div>
                  <div className="whitespace-pre-wrap text-gray-100 text-[15px] leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20">
                  <User className="h-6 w-6 text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="relative mt-4 px-6 pb-6">
        <div className="relative">
          <textarea
            className="w-full rounded-xl glass-morphism p-5 pr-14 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-[15px]"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              minHeight: '64px',
              maxHeight: '200px'
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading}
            className="absolute bottom-3 right-3 h-11 w-11 rounded-lg bg-blue-600/80 p-0 hover:bg-blue-600 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-200" />
            ) : (
              <Send className="h-5 w-5 text-gray-200" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
