import {PlayerStats} from './player-stats'

export interface Account {
    id: string
    createdAt: number
    name: string
    stats: PlayerStats
}
