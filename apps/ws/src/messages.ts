export const INIT_GAME="init_game"
export const MOVE="move"
export const GAME_OVER="game_over"
export const JOIN_GAME="join_game"
export type MoveDb={
    gameId:number
    playerId:string
    from:string
    to:string
    moveNumber:number
}