const request = require('request')
const config = require('../config/config.js')
const crypto = require('crypto')
const zlib = require('zlib')

module.exports = (app) => {
    const proxyBasePath = "/core"

    app.all(proxyBasePath + "*", (req, res, next) => {
        let serverPath = serverPath.normalize(req.path.slice(proxyBasePath.length)).slice(1)

        if(req.cookies.sessionId)
            req.query.sessionId = req.cookies.sessionId

        let xsrfBypassPaths = [
            "/accounts",
            "/sessions/auth",
            "/processIdentityToken",
            "/sendResetPassword",
            "/mfa/upgradeSession"
        ]

        if(req.cookies.sessionId && (req.method == "POST" || req.method == "PUT" || req.method == "DELETE") && !xsrfBypassPaths.includes(serverPath)) {
            let token = crypto.createHmac('sha256', config.xsrfSalt)
                .update(req.cookies.sessionId)
                .digest('base64')

            if(token != req.headers["x-xsrf-token"]) {
                console.log(`Failed XSRF check. accountId: ${req.cookies.accountId}, ${req.method} ${serverPath}`)
                return res.status(401).json({
                    type: "AccessDeniedException",
                    transient: false,
                    message: "Access denied"
                })
            }
        }

        req.pipe(request({
            url: config.serverUrl + "/" + serverPath,
            method: req.method,
            headers: {
                'X-Api-Version': apiVersion,
                'X-Forwarded-Proto': req.protocol,
                'X-Forwarded-For': req.headers['X-Forwarded-For'],
                'Content-Type': req.headers['Content-Type']
            },
            qs: req.query,
            useQuerystring: true
        }))
            .on("error", err => {
                console.log("Failed to connect to core for proxied API call", req.method + " " + serverPath)
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
                        if((serverPath == "sessions/auth" || serverPath == "accounts") && response.statusCode == 200) {
                            try {
                                let buf = response.headers['content-encoding'] == "gzip" ? zlib.gunzipSync(data) : data
                                let body = JSON.parse(buf)
                                let token = crypto.createHmac('sha256', config.xsrfSalt)
                                    .update(body.sessionId)
                                    .digest('base64')

                                res.cookie("XSRF-TOKEN", token, {
                                    expires: new Date(new Date().getTime() + 24*60*60*1000),
                                    path: "/",
                                    secure: config.prod || config.staging
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
