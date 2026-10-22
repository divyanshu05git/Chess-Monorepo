import { useNavigate } from "react-router"
import GoogleLoginButton from "../components/GoogleLoginButton";

export const Landing=()=>{
    const navigate=useNavigate();
    return (
        <main className="min-h-screen bg-white text-[#171717]">
          <div className="absolute top-6 right-6 z-10">
          <GoogleLoginButton />
        </div>
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <section className="grid w-full items-center gap-12 md:grid-cols-2 md:gap-20">

          {/* Chessboard image */}
          <div className="mx-auto w-full max-w-[460px]">
            <img
              src="/chessBoard.jpeg"
              alt="Chessboard ready for a game"
              className="aspect-square w-full rounded-md object-cover shadow-2xl"
            />

            <p className="mt-4 text-center text-xs tracking-[0.25em] text-[#aaa697]">
              YOUR NEXT MOVE STARTS HERE
            </p>
          </div>

          {/* Hero content */}
          <div className="mx-auto w-full max-w-md text-center md:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#777064]/40 px-4 py-2 text-xs font-medium tracking-[0.2em] text-[#c9c2af]">
              <span className="text-[#8BCB50]">♞</span>
              THINK · PLAY · IMPROVE
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              Play Chess
              <br />
              <span className="text-[#8BCB50]">Online.</span>
              <br />
              Your Next Move.
            </h1>

            <p className="mt-6 text-base leading-7 text-[#c2bdb2] sm:text-lg">
              Challenge players online, sharpen your strategy, and
              make every move count. Your next great game starts here.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm md:justify-start">
              <p>
                <span className="font-bold text-[#8BCB50]">64</span>
                <span className="ml-2 text-[#aaa69c]">Squares</span>
              </p>

              <p>
                <span className="font-bold text-[#8BCB50]">∞</span>
                <span className="ml-2 text-[#aaa69c]">Possibilities</span>
              </p>
            </div>

            {/* Single CTA */}
            <button
               onClick={()=>{
                navigate("/game")
               }}
               
               className="group mt-9 flex w-full items-center gap-4 rounded-xl bg-[#8BCB50] px-6 py-5 text-left text-[#171717] shadow-[0_5px_0_#679638] transition-all duration-200 hover:-translate-y-1 hover:bg-[#9AD963] hover:shadow-[0_7px_0_#679638] active:translate-y-1 active:shadow-none"
            >
              <span className="text-3xl">♟</span>

              <span className="flex-1">
                <span className="block text-xl font-bold sm:text-2xl">
                  Play Online
                </span>
                {/* <span className="mt-1 block text-sm text-white/85">
                  Play with someone at your level
                </span> */}
              </span>

              <span className="text-2xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
            
            <p className="mt-5 text-center text-xs text-[#938e82] md:text-left">
              Every game is a new opportunity.
            </p>
          </div>

        </section>
        </div>
       </main> 
    )
}