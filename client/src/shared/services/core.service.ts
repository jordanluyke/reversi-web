import {Injectable} from '@angular/core'
import {HttpResponse, HttpHeaders, HttpParams, HttpClient, HttpEventType, HttpErrorResponse} from '@angular/common/http'
import {Observable, of, empty, throwError} from 'rxjs'
import {flatMap, catchError, retryWhen, delay} from 'rxjs/operators'
import {ServerRequestOptions} from './model/index'

/**
 * @author Jordan Luyke
 */

@Injectable()
export class CoreService {

    constructor(private httpClient: HttpClient) {
    }

    public get(corePath: string, options?: ServerRequestOptions): Observable<any> {
        return this.request("GET", corePath, options)
    }

    public post(corePath: string, options?: ServerRequestOptions): Observable<any> {
        return this.request("POST", corePath, options)
    }

    public put(corePath: string, options?: ServerRequestOptions): Observable<any> {
        return this.request("PUT", corePath, options)
    }

    public delete(corePath: string, options?: ServerRequestOptions): Observable<any> {
        return this.request("DELETE", corePath, options)
    }

    private request(method: string, corePath: string, options?: ServerRequestOptions): Observable<any> {
        let proxyPath = "/core" + corePath

        options = options || {}
        options.headers = options.headers || new HttpHeaders()
        options.body = options.body || {}
        options.params = options.params || new HttpParams()

        let retryAttempt = 0
        return this.httpClient.request(method, proxyPath, Object.assign(options, {
            observe: "response"
        }))
            .pipe(
                flatMap((response: any) => {
                    if(response.type == HttpEventType.UploadProgress) {
                        let percentDone = Math.round(100 * event["loaded"] / event["total"])
                        console.log(`File is ${percentDone}% uploaded.`)
                    } else if(response instanceof HttpResponse) {
                        if(response.status == 204)
                            return of({})
                        return of(response.body)
                    }
                    return empty()
                }),
                catchError(response => {
                    if(response instanceof HttpErrorResponse) {
                        try {
                            let body = response.error
                            return throwError(body)
                        } catch(err) {
                            throw new Error("Unable to parse server response")
                        }
                    } else
                        throw new Error("Caught response is invalid type: " + response.type)
                }),
                retryWhen(errors => errors.pipe(
                    flatMap(err => {
                        if(err.type == "ConnectionException") {
                            const maxRetry = 3
                            retryAttempt++
                            if(retryAttempt == maxRetry)
                                return throwError(err)
                            return of(err).pipe(
                                delay(1000)
                            )
                        } else
                            return throwError(err)
                    })
                ))
            )
    }
}
