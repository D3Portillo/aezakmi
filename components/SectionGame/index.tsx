"use client"

import type { MatchPlayer } from "@/lib/types/matchmaking"

import { useGameLogic } from "./useGameLogic"
import GameHeader from "./GameHeader"
import BattleArena from "./BattleArena"
import GamePad from "./GamePad"
import CardRevealModal from "./CardRevealModal"
import CardFlyAnimation from "./CardFlyAnimation"
import OutcomeModal from "./OutcomeModal"
import FinalBanner from "./FinalBanner"
import GameStyles from "./GameStyles"

type SectionGameProps = {
  match?: { roomId: string; players: MatchPlayer[]; isMock?: boolean } | null
  currentPlayerId?: string | null
}


export default function SectionGame({
  match,
  currentPlayerId,
}: SectionGameProps) {
  const {
    playerDisplayName,
    opponentDisplayName,
    playerHearts,
    rivalHearts,
    currentMatch,
    timeLeft,
    finalWinner,
    finalRewards,
    finalBannerVisible,
    battleReady,
    battlePhase,
    battleOutcome,
    showOutcomeModal,
    placedCard,
    rivalPlacedCard,
    cardsFaceUp,
    playerHand,
    selectedCard,
    selectedIndex,
    activeHandIndex,
    fanOpened,
    revealOpen,
    revealKey,
    movingPlayerCard,
    movingRivalCard,
    movePlayerActive,
    moveRivalActive,
    cardArtFailed,
    playerNukeUsed,
    revealCardRef,
    handleSelectCard,
    handleUse,
    handleNukeConfirm,
    handleRetreatConfirm,
    handleFinalBannerAccept,
    advanceToNextMatch,
    handlePlayerCardLand,
    handleRivalCardLand,
    setSelectedCard,
    setActiveHandIndex,
  } = useGameLogic(match, currentPlayerId)

  return (
    <main className="relative bg-black/55 overflow-x-hidden flex flex-col items-center min-h-screen pb-6 gap-6">
      <GameHeader
        playerDisplayName={playerDisplayName}
        opponentDisplayName={opponentDisplayName}
        rivalHearts={rivalHearts}
      />

      <BattleArena
        selectedIndex={selectedIndex}
        rivalPlacedCard={rivalPlacedCard}
        cardsFaceUp={cardsFaceUp}
        battlePhase={battlePhase}
        timeLeft={timeLeft}
        currentMatch={currentMatch}
        placedCard={placedCard}
      />

      <GamePad
        battleReady={battleReady}
        playerHand={playerHand}
        playerHearts={playerHearts}
        activeHandIndex={activeHandIndex}
        fanOpened={fanOpened}
        cardArtFailed={cardArtFailed}
        finalWinner={finalWinner}
        playerNukeUsed={playerNukeUsed}
        onSelectCard={handleSelectCard}
        onNukeConfirm={handleNukeConfirm}
        onRetreatConfirm={handleRetreatConfirm}
      />

      {selectedCard && (
        <CardRevealModal
          card={selectedCard}
          revealOpen={revealOpen}
          revealKey={revealKey}
          revealCardRef={revealCardRef}
          selectedIndex={selectedIndex}
          cardArtFailed={cardArtFailed}
          onClose={() => {
            setSelectedCard(null)
            setActiveHandIndex(null)
          }}
          onUse={handleUse}
        />
      )}

      <CardFlyAnimation
        movingPlayerCard={movingPlayerCard}
        movingRivalCard={movingRivalCard}
        movePlayerActive={movePlayerActive}
        moveRivalActive={moveRivalActive}
        cardArtFailed={cardArtFailed}
        onPlayerCardLand={handlePlayerCardLand}
        onRivalCardLand={handleRivalCardLand}
      />

      <OutcomeModal
        show={showOutcomeModal}
        outcome={battleOutcome}
        onDismiss={advanceToNextMatch}
      />

      {finalWinner && finalRewards && (
        <FinalBanner
          winner={finalWinner}
          rewards={finalRewards}
          visible={finalBannerVisible}
          playerDisplayName={playerDisplayName}
          opponentDisplayName={opponentDisplayName}
          onAccept={handleFinalBannerAccept}
        />
      )}

      <GameStyles />
    </main>
  )
}
