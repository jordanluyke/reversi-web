import {Injectable} from '@angular/core'
import {Subject, ReplaySubject} from 'rxjs'
import * as Pusher from 'pusher-js'
import {CoreConfigService} from './core-config.service'
import {PusherChannel} from './model/index'

// hack due to jit/aot differences
const _Pusher = (Pusher as any).default ? (Pusher as any).default : Pusher

/**
 * @author Jordan Luyke
 */

@Injectable()
export class PusherService {

    private pusher: Pusher.Pusher
    private onLoad: ReplaySubject<void> = new ReplaySubject(1)
    private started = false

    constructor(private coreConfigService: CoreConfigService) {}

    public subscribe(channel: PusherChannel, event: string): Subject<any> {
        if(!this.started) {
            this.load()
            this.started = true
        }
        let subject = new Subject()
        console.log("subscribing channel", channel)
        this.onLoad.subscribe(
            Void => {
                let pusherChannel = this.pusher.channel(channel)
                if(pusherChannel == null)
                    pusherChannel = this.pusher.subscribe(channel)
                console.log("1")
                pusherChannel.bind(event, (data: any) => subject.next(data))
            }
        )
        return subject
    }

    public unsubscribe(channelName: string): void {
        this.pusher.unsubscribe(channelName)
    }

    public clear(): void {
        if(this.pusher && this.pusher.channels)
            for(let channel in this.pusher.channels.channels)
                this.unsubscribe(channel)
    }

    private load(): void {
        this.coreConfigService.onLoad
            .subscribe(Void => {
                try {
                    this.pusher = new _Pusher(this.coreConfigService.config.pusherKey, {
                        cluster: this.coreConfigService.config.pusherCluster,
                        encrypted: true
                    })
                    this.onLoad.next(null)
                } catch(e) {
                    console.error("Pusher fail")
                }
            })
    }
}
