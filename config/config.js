module.exports = {
    coreUrl: process.env.CORE_URL || "https://localhost:8080",
    xsrfSalt: process.env.XSRF_SALT || "wowmuchsalt",
}
