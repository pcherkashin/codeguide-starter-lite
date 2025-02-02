'use client'

import Chat from '@/components/Chat'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black overflow-hidden">
      {/* Background grid with reduced opacity */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Multiple radial gradients for a dynamic effect */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_0%_0%,#ffffff08,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_100%_0%,#0000ff05,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_100%_100%,#ffffff05,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_1000px_at_0%_100%,#0000ff05,transparent)]" />
      </div>

      {/* Animated gradient background */}
      <div className="fixed inset-0 opacity-[0.02] bg-[size:60px_60px] [background-image:linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff)] animate-[gradient_60s_linear_infinite]" />

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <Chat />
      </div>
    </main>
  )
}
