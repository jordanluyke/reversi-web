import {SocketEvent} from './socket-event'
import {Subject} from 'rxjs'

export class SocketSubscription {
    public event: SocketEvent
    public channel?: string
    public subject: Subject<any>
}