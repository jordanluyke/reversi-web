module.exports = {
    coreUrl: process.env.CORE_URL || "http://localhost:8080",
    xsrfSalt: process.env.XSRF_SALT || "wowmuchsalt",
}
