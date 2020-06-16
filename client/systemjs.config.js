let map = {
    "app": "src",
    "@angular": "node_modules/@angular",
    "rxjs": "node_modules/rxjs",
    "bignumber.js": "node_modules/bignumber.js",
    "@ng-bootstrap": "node_modules/@ng-bootstrap",
    "angularx-social-login": "node_modules/angularx-social-login",
    "pusher-js": "node_modules/pusher-js",
};

let packages = {
    "app": {
        main: "main",
        defaultExtension: "js",
        meta: {
            "./*.js": {
                loader: "systemjs-angular-loader.js"
            }
        }
    },
    "rxjs": {
        main: "index.js",
        defaultExtension: "js"
    },
    "rxjs/operators": {
        main: "index.js",
        defaultExtension: "js"
    },
    "bignumber.js": {
        main: "bignumber.min.js",
        defaultExtension: "js"
    },
    "@ng-bootstrap/ng-bootstrap": {
        main: "bundles/ng-bootstrap.umd.min.js",
        defaultExtension: "js"
    },
    "angularx-social-login": {
        main: "bundles/angularx-social-login.umd.min.js",
        defaultExtension: "js"
    },
    "pusher-js": {
        main: "dist/web/pusher.min.js",
        defaultExtension: "js"
    }
};

[
    "compiler",
    "core",
    "forms",
    "localize",
    "platform-browser",
    "platform-browser-dynamic",
    "router"
].forEach(name => {
    packages[`@angular/${name}`] = {
        main: `bundles/${name}.umd.min.js`,
        defaultExtension: "js"
    };
});

packages["@angular/common"] = {
    main: "bundles/common.umd.min.js",
    map: {
        "./http": "./bundles/common-http.umd.min.js",
    },
    defaultExtension: "js"
};

System.config({
    map: map,
    packages: packages
});
