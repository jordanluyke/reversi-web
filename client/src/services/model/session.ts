export class Session {
    public sessionId: string
    public accountId: string

    public validate(): boolean {
        return !!this.sessionId && !!this.accountId
    }
}
