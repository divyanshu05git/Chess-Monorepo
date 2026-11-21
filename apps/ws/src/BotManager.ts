
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface } from "node:readline";
import { createRequire } from "node:module";
import { db } from "@repo/db";

export const BOT_LEVELS = {
  beginner: { name: "Beginner", skill: 0,  movetime: 100  },
  easy:     { name: "Easy",     skill: 5,  movetime: 200  },
  medium:   { name: "Medium",   skill: 10, movetime: 400  },
  hard:     { name: "Hard",     skill: 15, movetime: 800  },
  master:   { name: "Master",   skill: 20, movetime: 1500 },
} as const;

export type BotLevel = keyof typeof BOT_LEVELS;
export function createBotUserId(level: BotLevel): string {
    return `bot-${level}`;
}
export const isBotUserId = (id: string) => id.startsWith("bot-");

export function levelFromBotId(id: string): BotLevel | null {
    if (!isBotUserId(id)) return null;

    const level = id.split("-")[1];

    if (!level || !Object.hasOwn(BOT_LEVELS, level)) {
        return null;
    }

    return level as BotLevel;
}

// no spaces, because the client shows only the first word of a name
export const botName = (id: string) => {
  const level = levelFromBotId(id);
  return level ? `Stockfish-${BOT_LEVELS[level].name}` : "Stockfish";
};

// one Stockfish process, one search at a time
class UciEngine {
  private proc: ChildProcessWithoutNullStreams;
  private onLine: ((line: string) => void) | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private ready: Promise<void>;

  constructor() {
    const require = createRequire(import.meta.url);
    const enginePath: string = require("stockfish").findEngine("lite-single");

    this.proc = spawn(process.execPath, [enginePath], { stdio: "pipe" });
    this.proc.stderr.resume();                       // drain it so the pipe never fills up
    createInterface({ input: this.proc.stdout }).on("line", (l) => this.onLine?.(l));
    this.proc.on("error", (e) => console.error("Stockfish process error:", e));
    process.once("exit", () => this.proc.kill());
    this.proc.stdin.on("error", (e) => console.error("Stockfish stdin error:", e));
    this.proc.on("exit", () => { engine = null; });     // the next bot move starts a fresh process

    this.ready = this.run(["uci"], "uciok")
      .then(() => this.run(["isready"], "readyok"))
      .then(() => undefined);
    this.ready.catch((e) => console.error("Stockfish failed to start:", e));
  }

  // send commands, then wait for a line that starts with `until`
  private run(cmds: string[], until: string, timeoutMs = 10_000): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.onLine = null;
        this.proc.stdin.write("stop\n");
        reject(new Error("engine timeout"));
      }, timeoutMs);

      this.onLine = (line) => {
        if (!line.startsWith(until)) return;
        clearTimeout(timer);
        this.onLine = null;
        resolve(line);
      };
      for (const c of cmds) this.proc.stdin.write(c + "\n");
    });
  }

  // jobs wait in line, so many bot games can never overload the CPU
  bestMove(fen: string, level: { skill: number; movetime: number }) {
    const job = this.queue.then(async () => {
      await this.ready;
      const line = await this.run(
        [
          `setoption name Skill Level value ${level.skill}`,
          `position fen ${fen}`,
          `go movetime ${level.movetime}`,
        ],
        "bestmove",
        level.movetime + 5_000
      );
      return line.split(" ")[1] ?? null;
    });
    this.queue = job.catch(() => undefined);
    return job;
  }
}

let engine: UciEngine | null = null;

// returns a move like "e7e5" or "e7e8q", or null if the engine failed
export const getBotMove = async (fen: string, level: BotLevel) => {
  engine ??= new UciEngine();           // the process starts on the first bot game
  try {
    const best = await engine.bestMove(fen, BOT_LEVELS[level]);
    return best && best !== "(none)" ? best : null;
  } catch {
    return null;
  }
};

export const ensureBotUsers = async () => {
  for (const [level, cfg] of Object.entries(BOT_LEVELS)) {
    const id = createBotUserId(level as BotLevel);          // "bot-beginner", "bot-easy", ...
    const exists = await db.orm.public.User.where({ id }).first();
    if (exists) continue;

    const created = await db.orm.public.User.create({
      id,
      email: `${id}@bot.local`,          // required and unique
      googleId: `bot:${id}`,             // required and unique, and no real Google account can match it
      name: `Stockfish-${cfg.name}`,     // no spaces: the client shows only the first word of a name
      avatar: null,
    });

    // `id` has @onCreate(uuid()), so check the database really kept our id
    if (created.id !== id) {
      console.error(`Bot user got id ${created.id} instead of ${id}. Seed the bot rows with SQL instead.`);
    }
  }
};