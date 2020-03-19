import {PusherChannel} from './pusher-channel'
import {Subject} from 'rxjs'

export class SocketSubscription {
    constructor(
        public event: PusherChannel,
        public channel: string,
        public subject: Subject<any>
    ) {}
}