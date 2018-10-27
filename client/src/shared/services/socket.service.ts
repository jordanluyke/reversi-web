import {Injectable} from '@angular/core'
import {Subject, from, Observable, of, throwError} from 'rxjs'
import {tap, filter, flatMap, take} from 'rxjs/operators'
import {WebSocketSubject} from 'rxjs/webSocket'
import {ErrorHandlingSubscriber} from '../util/index'
import {SocketEvent, SocketSubscription} from './model/index'
import {Resolve, Router} from '@angular/router'

@Injectable()
export class SocketService implements Resolve<Observable<void>> {

    private started = false
    private ws?: WebSocketSubject<any>
    private subscriptions: SocketSubscription[] = []
    private disconnected = false

    constructor(private router: Router) {}

    public init(): Observable<void> {
        let supportsWebSockets = "WebSocket" in window
        if(!supportsWebSockets) {
            this.router.navigate(["/not-supported"])
            return throwError(null)
        }

        this.createAndSubscribeSocket()

        this.subscribe(SocketEvent.KeepAlive)
            .pipe(tap(Void => {
                this.ws.next({
                    event: SocketEvent.KeepAlive
                })
            }))
            .subscribe(new ErrorHandlingSubscriber())

        return of(null)
    }

    public subscribe(event: SocketEvent, channel?: string): Subject<any> {
        if(channel != null && this.subscriptions.find(s => s.event == event) == null) {
            this.ws.next({
                event: event,
                channel: channel,
            })
        }

        let subject = new Subject()
        this.subscriptions.push(new SocketSubscription(event, channel, subject))
        return subject
    }

    private createAndSubscribeSocket(): void {
        this.ws = new WebSocketSubject({
            url: `ws://${location.hostname}:8080`,
            binaryType: "arraybuffer",
            serializer: (body) => {
                let str = JSON.stringify(body)
                let buf = new ArrayBuffer(str.length * 2)
                let bufView = new Uint16Array(buf)
                for(let i = 0, strLen = str.length; i < strLen; i++)
                    bufView[i] = str.charCodeAt(i)
                return buf
            },
            deserializer: (event) => JSON.parse(String.fromCharCode.apply(null, new Uint8Array(event.data))),
            openObserver: {
                next: (event: Event) => {
                    console.log("opened")
                    if(this.disconnected) {
                        this.disconnected = false
                        this.subscriptions
                            .filter(sub => sub.channel != null)
                            .forEach(sub => {
                                this.ws.next({
                                    event: sub.event,
                                    channel: sub.channel
                                })
                        })
                    }
                }
            },
            closeObserver: {
                next: (event: CloseEvent) => {
                    this.disconnected = true
                    console.log("closed")
                    // use rx and remove on logout
                    setTimeout(() => this.createAndSubscribeSocket(), 5000)
                }
            }
        })

        this.ws
            .pipe(
                tap(data => console.log(data)),
                flatMap(data => from(this.subscriptions)
                    .pipe(
                        filter(sub => sub.event == data.event),
                        take(1)
                    )
                ),
                tap(sub => sub.subject.next(null)),
            )
            .subscribe(
                Void => {},
                err => {
                    console.error(err)
                },
                () => {
                    console.log("WebSocket completed")
                }
            )
    }

    public resolve(): Observable<void> {
        if(this.started)
            return of(null)
        this.started = true
        return this.init()
    }
}
