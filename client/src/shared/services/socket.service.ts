import {Injectable} from '@angular/core'
import {Subject, from, Observable, of} from 'rxjs'
import {tap, filter, flatMap, map} from 'rxjs/operators'
import {WebSocketSubject} from 'rxjs/webSocket'
import {ArrayListMultimap, Multimap, ErrorHandlingSubscriber} from '../util/index'
import {SocketEvent} from './model/index'
import {Resolve} from '@angular/router'

@Injectable()
export class SocketService implements Resolve<Observable<void>> {

    private started = false
    private ws: WebSocketSubject<any> = new WebSocketSubject({
        url: "ws://10.0.1.3:8080",
        binaryType: "arraybuffer",
        serializer: this.serializer,
        deserializer: this.deserializer
    })
    private subscriptions: Multimap<SocketEvent, Subject<any>> = new ArrayListMultimap()

    public init(): void {
        try {
            this.ws
                .pipe(
                    tap(data => console.log(data)),
                    map(data => this.subscriptions.get(data.event)),
                    filter((subjects: Subject<any>[]) => subjects.length > 0),
                    flatMap(subjects => from(subjects)),
                    tap(subject => subject.next(null))
                )
                .subscribe(
                    Void => {},
                    err => {
                        console.error(err)
                    },
                    () => {
                        console.log("websocket completed")
                    }
                )

            this.subscribe(SocketEvent.KeepAlive)
                .pipe(tap(Void => {
                    this.ws.next({
                        event: SocketEvent.KeepAlive.toString()
                    })
                }))
                .subscribe(new ErrorHandlingSubscriber())
        } catch(err) {
            console.error(err)
        }
    }

    private serializer(body: any): ArrayBuffer {
        let str = JSON.stringify(body)
        let buf = new ArrayBuffer(str.length * 2)
        let bufView = new Uint16Array(buf)
        for(let i = 0, strLen = str.length; i < strLen; i++)
            bufView[i] = str.charCodeAt(i)
        return buf
    }

    private deserializer(event: MessageEvent): any {
        return JSON.parse(String.fromCharCode.apply(null, new Uint8Array(event.data)))
    }

    public subscribe(event: SocketEvent, channel?: string): Subject<any> {
        if(channel != null && this.subscriptions.get(event).length == 0) {
            this.ws.next({
                event: event,
                channel: channel,
            })
        }

        let subject = new Subject()
        this.subscriptions.put(event, subject)
        return subject
    }

    public resolve(): Observable<void> {
        if(!this.started)
            this.init()
        this.started = true
        return of(null)
    }
}
