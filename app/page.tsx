"use client"

type Card = "Cowboy" | "Zombie" | "Alien"

const PLAYER_HAND: Card[] = ["Cowboy", "Zombie", "Alien"]
const CARD_INITIAL: Record<Card, string> = {
  Cowboy: "C",
  Zombie: "Z",
  Alien: "A",
}

export default function Home() {
  return (
    <main className="relative flex flex-col items-center min-h-screen p-6">
      <section className="grow">
        <h1 className="text-4xl font-bold mb-6">Card Game</h1>
      </section>

      <div
        className="relative w-80 sm:w-96 h-48 sm:h-56 flex items-end justify-center"
        style={{ perspective: 800 }}
      >
        {PLAYER_HAND.map((card, idx) => {
          const fanOffsets = [-80, 0, 80]
          const rotations = [-12, 0, 12]
          const lift = [8, 14, 8]
          return (
            <div
              key={`${card}-${idx}`}
              className="absolute bottom-0 w-28 h-40 sm:w-40 sm:h-52 border-2 border-neutral-800 rounded-xl flex items-center justify-center text-base font-bold bg-white shadow-xl transition-[transform,box-shadow] duration-200 ease-out select-none"
              style={{
                transform: `translateX(${fanOffsets[idx]}px) translateY(${-lift[idx]}px) rotate(${rotations[idx]}deg)`,
                transformOrigin: "bottom center",
              }}
              onMouseEnter={(event) => {
                const target = event.currentTarget
                target.style.transform = `translateX(${fanOffsets[idx]}px) translateY(-30px) rotate(${rotations[idx]}deg)`
                target.style.boxShadow = "0 24px 36px rgba(0,0,0,0.24)"
              }}
              onMouseLeave={(event) => {
                const target = event.currentTarget
                target.style.transform = `translateX(${fanOffsets[idx]}px) translateY(${-lift[idx]}px) rotate(${rotations[idx]}deg)`
                target.style.boxShadow = "0 18px 30px rgba(0,0,0,0.2)"
              }}
            >
              <div className="flex flex-col items-center gap-1.5 text-black">
                <div className="text-5xl leading-none">
                  {CARD_INITIAL[card]}
                </div>
                <div className="text-sm tracking-[0.6px]">{card}</div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
