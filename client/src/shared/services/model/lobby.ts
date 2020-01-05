export interface Lobby {
    id: string
    createdAt: number
    updatedAt: number
    startingAt: number
    name?: string
    playerIdDark: string
    playerIdLight?: string
    private: boolean
    playerReadyDark: boolean
    playerReadyLight: boolean
    matchId?: string
}
