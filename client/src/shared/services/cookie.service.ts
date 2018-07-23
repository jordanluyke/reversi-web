import {Injectable} from '@angular/core'
import {TimeUnit, Instant} from '../util/index'

/**
 * @author Jordan Luyke
 */

@Injectable()
export class CookieService {

    public get(name: string): string | null {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null
    }

    public remove(name: string): void {
        document.cookie = name + "=;expires=" + new Date(0).toUTCString()
    }

    public put(key: string, value: string, options?: CookieOptions): void {
        options = options || {}
        let path = options.path || "/"
        let expires = (options.expires || Instant.now().plus(1, TimeUnit.DAYS)).toDate().toUTCString()
        let secure = location.protocol == "https:" ? "secure" : ""

        document.cookie = `${key}=${value};path=${path};expires=${expires};${secure}`
    }
}

interface CookieOptions {
    path?: string
    secure?: boolean
    expires?: Instant
}
