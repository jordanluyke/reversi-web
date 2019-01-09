module.exports = {
    coreUrl: "http://localhost:8080",
    xsrfSalt: process.env.XSRF_SALT || "wowmuchsalt",
    // isProduction: !!process.env.PRODUCTION,
    // getCoreHttpUrl: () => (exports.isProduction ? "https://" : "http://") + exports.coreHost,
    // getCoreWsUrl: () => (exports.isProduction ? "wss://" : "ws://") + (process.env.WS_HOST || exports.coreHost),
}
