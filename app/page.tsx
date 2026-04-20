import { CardMemoryGame } from "@/components/card-memory-game"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <CardMemoryGame />
      </div>
    </main>
  )
}
