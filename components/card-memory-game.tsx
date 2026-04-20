"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlayingCard, createMultiDeck, type Card as CardType, type Suit, type Rank } from "@/components/playing-card"
import { cn } from "@/lib/utils"

type GamePhase = "setup" | "memorize" | "recall" | "result"
type DisplayMode = "one-by-one" | "whole"

interface GuessRecord {
  position: number
  correctCard: CardType
  guessedCard: CardType | null
  isCorrect: boolean
  timestamp: number
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"]
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

const suitNames: Record<Suit, string> = {
  "♠": "Spades",
  "♥": "Hearts",
  "♦": "Diamonds",
  "♣": "Clubs",
}

const suitButtonColors: Record<Suit, string> = {
  "♠": "bg-slate-800 hover:bg-slate-700 text-white",
  "♣": "bg-slate-700 hover:bg-slate-600 text-white",
  "♥": "bg-red-500 hover:bg-red-400 text-white",
  "♦": "bg-red-600 hover:bg-red-500 text-white",
}

export function CardMemoryGame() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("setup")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("one-by-one")
  const [totalCards, setTotalCards] = useState(10)
  const [deck, setDeck] = useState<CardType[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null)
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([])
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [memorizeStartTime, setMemorizeStartTime] = useState<number>(0)
  const [memorizeDuration, setMemorizeDuration] = useState<number>(0)

  const startGame = useCallback(() => {
    const newDeck = createMultiDeck(totalCards)
    setDeck(newDeck)
    setCurrentIndex(0)
    setSelectedSuit(null)
    setGuessHistory([])
    setGamePhase("memorize")
    setMemorizeStartTime(Date.now())
  }, [totalCards])

  const startRecall = useCallback(() => {
    setMemorizeDuration(Date.now() - memorizeStartTime)
    setCurrentIndex(0)
    setSelectedSuit(null)
    setGamePhase("recall")
    setGameStartTime(Date.now())
  }, [memorizeStartTime])

  const nextCard = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, deck.length])

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const handleSuitSelect = (suit: Suit) => {
    setSelectedSuit(suit)
  }

  const handleRankSelect = (rank: Rank) => {
    if (!selectedSuit) return

    const guessedCard: CardType = {
      suit: selectedSuit,
      rank,
      id: `guess-${currentIndex}`,
    }

    const correctCard = deck[currentIndex]
    const isCorrect = correctCard.suit === selectedSuit && correctCard.rank === rank

    const record: GuessRecord = {
      position: currentIndex + 1,
      correctCard,
      guessedCard,
      isCorrect,
      timestamp: Date.now() - gameStartTime,
    }

    setGuessHistory([...guessHistory, record])
    setSelectedSuit(null)

    if (!isCorrect) {
      setGamePhase("result")
    } else if (currentIndex < deck.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // All cards guessed correctly
      setGamePhase("result")
    }
  }

  const resetGame = () => {
    setGamePhase("setup")
    setDeck([])
    setCurrentIndex(0)
    setSelectedSuit(null)
    setGuessHistory([])
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  const correctCount = guessHistory.filter((g) => g.isCorrect).length

  if (gamePhase === "setup") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Card Memory Game</CardTitle>
          <CardDescription>
            Memorize the order of cards and recall them perfectly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Number of Cards</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={520}
                value={totalCards}
                onChange={(e) => setTotalCards(Math.max(1, Math.min(520, parseInt(e.target.value) || 1)))}
                className="w-24 h-10 px-3 border border-input rounded-md bg-background text-foreground"
              />
              <span className="text-sm text-muted-foreground">
                ({Math.ceil(totalCards / 52)} deck{Math.ceil(totalCards / 52) > 1 ? "s" : ""})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 52, 104].map((num) => (
                <Button
                  key={num}
                  variant={totalCards === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTotalCards(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Display Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={displayMode === "one-by-one" ? "default" : "outline"}
                onClick={() => setDisplayMode("one-by-one")}
                className="h-auto py-3 flex flex-col"
              >
                <span className="text-lg">📄</span>
                <span>One by One</span>
              </Button>
              <Button
                variant={displayMode === "whole" ? "default" : "outline"}
                onClick={() => setDisplayMode("whole")}
                className="h-auto py-3 flex flex-col"
              >
                <span className="text-lg">📋</span>
                <span>Whole View</span>
              </Button>
            </div>
          </div>

          <Button onClick={startGame} className="w-full" size="lg">
            Start Game
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (gamePhase === "memorize") {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Memorize the Cards</CardTitle>
            <CardDescription>
              Take your time to memorize {deck.length} cards in order
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayMode === "one-by-one" ? (
              <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Card {currentIndex + 1} of {deck.length}
                </div>
                <div className="h-2 w-full max-w-xs bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
                  />
                </div>
                <PlayingCard card={deck[currentIndex]} size="lg" className="scale-150 my-8" />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextCard}
                    disabled={currentIndex === deck.length - 1}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 max-h-[60vh] overflow-y-auto p-4">
                {deck.map((card, index) => (
                  <div key={card.id} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                    <PlayingCard card={card} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button onClick={startRecall} size="lg" className="px-8">
            {"I'm Ready - Start Recall"}
          </Button>
        </div>
      </div>
    )
  }

  if (gamePhase === "recall") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Recall Card #{currentIndex + 1}</CardTitle>
            <CardDescription>
              {correctCount} correct so far • {deck.length - currentIndex} remaining
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${((currentIndex) / deck.length) * 100}%` }}
              />
            </div>

            {!selectedSuit ? (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">Select the suit first:</p>
                <div className="grid grid-cols-2 gap-3">
                  {SUITS.map((suit) => (
                    <Button
                      key={suit}
                      onClick={() => handleSuitSelect(suit)}
                      className={cn("h-16 text-2xl", suitButtonColors[suit])}
                    >
                      {suit} {suitNames[suit]}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-muted-foreground">Selected suit:</span>
                  <span className={cn(
                    "text-3xl",
                    selectedSuit === "♥" || selectedSuit === "♦" ? "text-red-500" : "text-foreground"
                  )}>
                    {selectedSuit}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSuit(null)}
                    className="ml-2"
                  >
                    Change
                  </Button>
                </div>
                <p className="text-center text-muted-foreground">Now select the rank:</p>
                <div className="grid grid-cols-5 gap-2">
                  {RANKS.map((rank) => (
                    <Button
                      key={rank}
                      variant="outline"
                      onClick={() => handleRankSelect(rank)}
                      className="h-12 text-lg font-bold"
                    >
                      {rank}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gamePhase === "result") {
    const allCorrect = correctCount === deck.length
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className={cn("text-3xl", allCorrect ? "text-green-500" : "text-destructive")}>
              {allCorrect ? "🎉 Perfect Score!" : "Game Over"}
            </CardTitle>
            <CardDescription className="text-lg">
              You got {correctCount} out of {deck.length} cards correct
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{correctCount}/{deck.length}</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{formatTime(memorizeDuration)}</div>
                <div className="text-sm text-muted-foreground">Memorize Time</div>
              </div>
            </div>
            <Button onClick={resetGame} className="w-full" size="lg">
              Play Again
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {guessHistory.map((record, index) => (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-[40px_1fr_auto] items-center gap-3 p-3 rounded-lg border",
                    record.isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                  )}
                >
                  <span className="text-sm text-muted-foreground">#{record.position}</span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <PlayingCard card={record.correctCard} size="sm" />
                      <span className="text-xs text-muted-foreground">correct</span>
                    </div>
                    {record.guessedCard && !record.isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">vs</span>
                        <PlayingCard card={record.guessedCard} size="sm" />
                        <span className="text-xs text-muted-foreground">guess</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      record.isCorrect ? "text-green-500" : "text-red-500"
                    )}>
                      {record.isCorrect ? "✓" : "✗"}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(record.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Show remaining cards that weren't guessed */}
              {guessHistory.length < deck.length && (
                <>
                  <div className="border-t border-dashed my-4 pt-4">
                    <p className="text-sm text-muted-foreground mb-3">Remaining cards you didn&apos;t reach:</p>
                  </div>
                  {deck.slice(guessHistory.length).map((card, index) => (
                    <div
                      key={card.id}
                      className="grid grid-cols-[40px_1fr] items-center gap-3 p-3 rounded-lg border bg-muted/50 border-muted"
                    >
                      <span className="text-sm text-muted-foreground">#{guessHistory.length + index + 1}</span>
                      <div className="flex items-center gap-2">
                        <PlayingCard card={card} size="sm" />
                        <span className="text-xs text-muted-foreground">not attempted</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
