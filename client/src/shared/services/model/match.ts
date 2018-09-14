export interface Match {
    id: string
    playerDarkId: string
    playerLightId: string
    board: Board
}

interface Board {
    squares: string[]
    transcript: string
}
