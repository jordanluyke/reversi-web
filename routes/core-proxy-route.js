const request = require('request')
const config = require('../config/config.js')
const crypto = require('crypto')
const zlib = require('zlib')
const path = require('path')

module.exports = (app) => {
    const proxyBasePath = "/core"

    app.all(proxyBasePath + "*", (req, res, next) => {
        let corePath = path.normalize(req.path.slice(proxyBasePath.length)).slice(1)

        if(req.cookies.sessionId)
            req.query.sessionId = req.cookies.sessionId

        let xsrfBypassPaths = [
            "accounts",
            "sessions",
        ]

        if(req.cookies.sessionId && (req.method == "POST" || req.method == "PUT" || req.method == "DELETE") && !xsrfBypassPaths.includes(corePath)) {
            let token = crypto.createHmac('sha256', config.xsrfSalt)
                .update(req.cookies.sessionId)
                .digest('base64')

            if(token != req.headers["x-xsrf-token"]) {
                console.log(`Failed XSRF check. accountId: ${req.cookies.accountId}, ${req.method} ${corePath}`)
                return res.status(401).json({
                    type: "AccessDeniedException",
                    transient: false,
                    message: "Access denied"
                })
            }
        }

        req.pipe(request({
            url: config.coreUrl + "/" + corePath,
            method: req.method,
            headers: {
                'X-Forwarded-Proto': req.headers['X-Forwarded-Proto'] || req.protocol,
                'X-Forwarded-For': req.headers['X-Forwarded-For'] || req.connection.remoteAddress,
                'Content-Type': req.headers['Content-Type']
            },
            qs: req.query,
            useQuerystring: true
        }))
            .on("error", err => {
                console.log("Failed to connect to core for proxied API call", req.method + " " + corePath)
                res.status(500).json({
                    type: "ConnectionException",
                    transient: true,
                    message: "Problem connecting to core"
                })
            })
            .on("response", response => {
                let data = Buffer.from([])
                response
                    .on("data", chunk => {
                        data = Buffer.concat([data, chunk])
                    })
                    .on("end", () => {
                        if((["accounts", "sessions"].includes(corePath)) && response.statusCode == 200) {
                            try {
                                let buf = response.headers['content-encoding'] == "gzip" ? zlib.gunzipSync(data) : data
                                let body = JSON.parse(buf)
                                let token = crypto.createHmac('sha256', config.xsrfSalt)
                                    .update(body.id)
                                    .digest('base64')

                                res.cookie("XSRF-TOKEN", token, {
                                    expires: new Date(new Date().getTime() + 24*60*60*1000),
                                    path: "/",
                                    // secure: config.prod || config.staging
                                })
                            } catch(e) {
                                console.log("Xsrf cookie assign fail:", e)
                            }
                        }

                        res.writeHead(response.statusCode, response.headers)
                        res.write(data)
                        res.end()
                    })
            })
    })
}
