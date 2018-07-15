module.exports = (app) => {
    app.get("*", (req, res, next) => {
        if(req.path != "/")
            res.redirect("/#" + req.url);
    });
};
