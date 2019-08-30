import {Injectable} from '@angular/core'
import {Subject, from, Observable, of, throwError, Subscription, interval} from 'rxjs'
import {tap, filter, flatMap, take} from 'rxjs/operators'
import {WebSocketSubject} from 'rxjs/webSocket'
import {ErrorHandlingSubscriber, WebUtil, TimeUnit, RandomUtil} from '../util/index'
import {SocketEvent, SocketSubscription} from './model/index'
import {Resolve, Router} from '@angular/router'
import {SessionService} from './session.service'

@Injectable()
export class SocketService implements Resolve<Observable<void>> {

    private started = false
    private ws?: WebSocketSubject<any>
    private subscriptions: SocketSubscription[] = []
    private disconnected = false
    private keepAliveSubscription?: Subscription
    private receiptSubscriptions: Map<string, Subscription> = new Map()

    constructor(
        private router: Router,
        private sessionService: SessionService,
    ) {}

    public init(): Observable<void> {
        let supportsWebSockets = "WebSocket" in window
        if(!supportsWebSockets) {
            this.router.navigate(["/not-supported"])
            return throwError(null)
        }

        this.createAndSubscribeSocket()
        this.removeSubsOnLogout()

        return of(null)
    }

    public subscribe(event: SocketEvent, channel?: string): Subject<any> {
        let data: any = {
            event: event
        }

        if(channel != null && this.subscriptions.find(s => s.event == event) == null)
            data.channel = channel

        this.next(data)

        let subject = new Subject()
        this.subscriptions.push(new SocketSubscription(event, channel, subject))
        return subject
    }

    public unsubscribe(event: SocketEvent, send = true): void {
        let sub = this.subscriptions.find(s => s.event == event)
        if(sub != null) {
            if(send) {
                this.next({
                    event: sub.event,
                    unsubscribe: true
                })
            }
            this.subscriptions = this.subscriptions.filter(s => s.event != sub.event)
        }
    }

    public next(o: any): void {
        let receiptId = RandomUtil.generate(6)
        o.receiptId = receiptId
        this.ws.next(o)

        let subscription = interval(TimeUnit.SECONDS.toMillis(3))
            .pipe(tap(Void => this.ws.next(o)))
            .subscribe(new ErrorHandlingSubscriber())
        this.receiptSubscriptions.set(receiptId, subscription)
    }

    private createAndSubscribeSocket(): void {
        this.ws = new WebSocketSubject({
            url: WebUtil.isSecureConnection() ? "wss://reversi.io:8443" : "ws://" + window.location.hostname + ":8080",
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
                    console.log("Socket opened")
                    this.startKeepAlive()
                    if(this.disconnected) {
                        this.disconnected = false
                        this.subscriptions
                            .forEach(sub => {
                                this.next({
                                    event: sub.event,
                                    channel: sub.channel
                                })
                                sub.subject.next(null)
                        })
                    }
                }
            },
            closeObserver: {
                next: (event: CloseEvent) => {
                    console.log("Socket closed")
                    this.stopKeepAlive()
                    this.disconnected = true
                    setTimeout(() => this.createAndSubscribeSocket(), 5000)
                }
            }
        })

        this.ws
            .pipe(
                tap(data => {
                    console.log(data)

                    if(data.receiptId != null) {
                        this.ws.next({
                            event: SocketEvent.Receipt,
                            id: data.receiptId
                        })
                    }

                    if(data.event == SocketEvent.Receipt) {
                        let sub = this.receiptSubscriptions.get(data.id)
                        if(sub != null) {
                            sub.unsubscribe()
                            this.receiptSubscriptions.delete(data.id)
                        } else {
                            console.error("Receipt subscription does not exist")
                        }
                    }
                }),
                flatMap(data => from(this.subscriptions)
                    .pipe(
                        filter(sub => sub.event == data.event),
                        take(1),
                        tap(sub => sub.subject.next(null)),
                    )
                ),
            )
            .subscribe(
                Void => {},
                err => console.error(err),
                () => console.log("WebSocket completed")
            )
    }

    public resolve(): Observable<void> {
        if(this.started)
            return of(null)
        this.started = true
        return this.init()
    }

    private startKeepAlive(): void {
        this.keepAliveSubscription = interval(TimeUnit.SECONDS.toMillis(10))
            .pipe(tap(Void => {
                this.ws.next({
                    event: SocketEvent.KeepAlive
                })
            }))
            .subscribe(new ErrorHandlingSubscriber())
    }

    private stopKeepAlive(): void {
        if(this.keepAliveSubscription != null)
            this.keepAliveSubscription.unsubscribe()
    }

    private removeSubsOnLogout(): void {
        this.sessionService.onClear
            .pipe(
                tap(sub => {
                    this.subscriptions.forEach(sub => {
                        this.next({
                            event: sub.event,
                            unsubscribe: true
                        })
                    })
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }
}
