import {PusherChannel} from './socket-event'
import {Subject} from 'rxjs'

export class SocketSubscription {
    constructor(
        public event: PusherChannel,
        public channel: string,
        public subject: Subject<any>
    ) {}
}