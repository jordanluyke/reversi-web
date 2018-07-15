const path = require('path')

module.exports = (app) => {
    app.get("/status", (req, res, next) => {
        res.sendFile(path.join(__dirname, "../client/target/status.json"))
    })
}
