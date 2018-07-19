import {TimeUnit} from './time-unit'

export class Instant {

    private constructor(private epoch: number) {}

    public static now(): Instant {
        return new Instant(new Date().getTime())
    }

    public plus(duration: number, unit: TimeUnit): Instant {
        return new Instant(this.epoch + unit.toMillis(duration))
    }

    public minus(duration: number, unit: TimeUnit): Instant {
        return new Instant(this.epoch - unit.toMillis(duration))
    }

    public static fromDate(date: Date): Instant {
        return new Instant(date.getTime())
    }

    public toDate(): Date {
        return new Date(this.epoch)
    }

    public static fromMillis(millis: number): Instant {
        return new Instant(millis)
    }

    public toMillis(): number {
        return this.epoch
    }
}