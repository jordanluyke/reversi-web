import {Side} from './square'

export interface Match {
    id: string
    playerDarkId: string
    playerLightId: string
    board: Board
    turn: Side
}

interface Board {
    squares: string[]
    transcript: string
}
