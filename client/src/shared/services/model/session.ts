import {Instant} from '../../util/index'

export class Session {
    public sessionId?: string
    public accountId?: string
    public expiresAt?: Instant

    public validate(): boolean {
        return !!this.sessionId && !!this.accountId
    }
}
