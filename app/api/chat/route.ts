import { NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    console.log('Sending request with messages:', messages)

    const requestBody = {
      stream: true,
      verbose: false,
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      deepseek_config: {
        headers: {},
        body: {}
      },
      anthropic_config: {
        headers: {},
        body: {}
      }
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch('http://138.201.199.112:1339', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DeepSeek-API-Token': process.env.DEEPSEEK_API_KEY!,
        'X-Anthropic-API-Token': process.env.ANTHROPIC_API_KEY!
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Server error response:', errorData)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              // Decode the chunk and split by lines
              const text = decoder.decode(value, { stream: true })
              console.log('Received chunk:', text)

              const lines = text.split('\n')
              for (const line of lines) {
                if (line.trim()) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = line.slice(6) // Remove 'data: ' prefix
                      const parsed = JSON.parse(data)
                      console.log('Parsed data:', parsed)

                      if (parsed.content) {
                        // Send only the text content
                        const content = parsed.content[0]?.text || ''
                        controller.enqueue(encoder.encode(content))
                      }
                    } catch (e) {
                      console.error('Error parsing JSON:', e)
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error('Stream reading error:', error)
          } finally {
            controller.close()
          }
        },
      }),
      {
        headers: { 'Content-Type': 'text/event-stream' },
      }
    )
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
