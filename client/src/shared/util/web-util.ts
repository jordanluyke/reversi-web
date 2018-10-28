export class WebUtil {

    public static isSecureConnection(): boolean {
        return location.protocol == "https:"
    }
}