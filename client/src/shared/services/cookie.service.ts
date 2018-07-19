import {Injectable} from '@angular/core'
import {TimeUnit} from '../util/index'

/**
 * @author Jordan Luyke
 */

@Injectable()
export class CookieService {

    public get(name: string): string | null {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null
    }

    public remove(name: string): void {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }

    public put(key: string, value: string, options?: CookieOptions): void {
        options = options || {}

        let o = {
            path: options.path || "/",
            secure: location.protocol == "https:",
            expires: options.expires ? options.expires.toUTCString() : new Date(TimeUnit.DAYS.toMillis(7) + new Date().getTime()).toUTCString()
        }

        let cookie = key + "=" + value
        for(let property in o)
            cookie += ";" + property + o[property]
        document.cookie = cookie
    }
}

interface CookieOptions {
    path?: string
    secure?: boolean
    expires?: Date
}

