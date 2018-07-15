import {Subscriber} from 'rxjs'

/**
 * @author Jordan Luyke <jordanluyke@gmail.com>
 */
export class ErrorHandlingSubscriber<T extends object> extends Subscriber<T> {

    public next(): void {
    }

    public complete(): void {
    }

    public error(error: any): void {
        console.error(error)
    }
}