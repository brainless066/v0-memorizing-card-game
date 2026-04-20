"use client"

import { cn } from "@/lib/utils"

export type Suit = "♠" | "♥" | "♦" | "♣"
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

export interface Card {
  suit: Suit
  rank: Rank
  id: string
}

interface PlayingCardProps {
  card: Card
  size?: "sm" | "md" | "lg"
  className?: string
  showBack?: boolean
}

const suitColors: Record<Suit, string> = {
  "♠": "text-slate-900",
  "♣": "text-slate-900",
  "♥": "text-red-600",
  "♦": "text-red-600",
}

const sizeClasses = {
  sm: "w-12 h-16 text-xs",
  md: "w-16 h-22 text-sm",
  lg: "w-20 h-28 text-base",
}

export function PlayingCard({ card, size = "md", className, showBack = false }: PlayingCardProps) {
  if (showBack) {
    return (
      <div
        className={cn(
          "rounded-lg border-2 border-amber-900/50 bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center shadow-lg",
          sizeClasses[size],
          className
        )}
      >
        <div className="w-3/4 h-3/4 border-2 border-amber-500/40 rounded bg-red-900/50 flex items-center justify-center">
          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(212,175,55,0.15)_4px,rgba(212,175,55,0.15)_8px)]" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-amber-900/30 bg-amber-50 p-1.5 shadow-lg relative",
        sizeClasses[size],
        suitColors[card.suit],
        className
      )}
    >
      {/* Top-left corner */}
      <div className="absolute top-1 left-1.5 leading-none">
        <span className="font-bold">{card.rank}</span>
      </div>
      {/* Center suit */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold">{card.suit}</span>
      </div>
      {/* Bottom-right corner (upside down) */}
      <div className="absolute bottom-1 right-1.5 leading-none rotate-180">
        <span className="font-bold">{card.rank}</span>
      </div>
    </div>
  )
}

export function createDeck(): Card[] {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"]
  const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  const deck: Card[] = []

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
      })
    })
  })

  return deck
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function createMultiDeck(totalCards: number): Card[] {
  const fullDecks = Math.floor(totalCards / 52)
  const remainingCards = totalCards % 52
  
  let allCards: Card[] = []
  
  // Add full decks
  for (let d = 0; d < fullDecks; d++) {
    const deck = createDeck().map(card => ({
      ...card,
      id: `${card.id}-deck${d}`
    }))
    allCards = [...allCards, ...deck]
  }
  
  // Add remaining cards from last deck (randomly selected)
  if (remainingCards > 0) {
    const lastDeck = createDeck().map(card => ({
      ...card,
      id: `${card.id}-deck${fullDecks}`
    }))
    const shuffledLastDeck = shuffleArray(lastDeck)
    allCards = [...allCards, ...shuffledLastDeck.slice(0, remainingCards)]
  }
  
  // Shuffle all cards
  return shuffleArray(allCards)
}
