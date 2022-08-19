const express = require("express");
const vhost = require('vhost');
const http = require('http');
const https = require('https');
const tls = require('tls');
const fs = require("fs");
const bodyParser = require('body-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./app/config');
const cors = require('cors');
const apiLimiter = rateLimit({
	windowMs: 1000,
	max: 10,
});

const attachHandlers = (app, domain) => {
    app.use(cors({
        origin: config.FRONTEND_URL
    }));
    app.use(function(req, res, next) {
        if(config.MODE === 'prod' && !req.socket.encrypted) return res.redirect(301, `https://${domain}${req.url}`);
        next();
    })
    
    // app.use(bodyParser.urlencoded({extended: true, limit: '25mb'}));
    // app.use(bodyParser.json({limit: '25mb'}));
    app.use(express.json({limit: '25mb'}));
    app.use(compression());
    // app.use(apiLimiter);
    // app.use(function (req, res, next) {
    //     let allowedOrigin = config.MODE === 'prod' ? `${req.protocol}://${domain}` : '*';
    //     res.set('Access-Control-Allow-Origin', allowedOrigin);
    //     res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, XSRF-TOKEN');
    //     res.set('Access-Control-Allow-Credentials', true);
    //     res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    //     res.set('Content-Security-Policy', "frame-ancestors 'self'");
    //     res.set('X-XSS-Protection', '1; mode=block');
    //     res.set('Referrer-Policy', 'strict-origin');
    //     res.set('X-Frame-Options', 'sameorigin');
    //     res.set('Surrogate-Control', 'no-store');

    //     const currentUrl = req.url.split("?")[0];
    //     if(
    //         currentUrl === '/' ||
    //         currentUrl.indexOf('/api') > -1
    //     ) {
    //         res.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    //         res.set('Expires', '0');
    //     } else {
    //         res.set('Cache-Control', 'public, max-age=86400');
    //     }

    //     res.removeHeader('X-Powered-By');
    //     res.removeHeader('Server');
    //     next();
    // });
    
    // app.disable('x-powered-by');
}

//Main app
const app = express();

//RMS
const rmsDomain = config.MODE === 'prod' ? config.RMS_APP_DOMAIN : 'localhost';
const rmsApp = express();
attachHandlers(rmsApp, rmsDomain);
// simple route
rmsApp.get("/", (req, res) => {
    res.json({ message: "Welcome to RMS backend." });
});
rmsApp.use('/api', require(`./app/api`));
app.use(vhost(rmsDomain, rmsApp));

//Caught errors in async functions
const LogUncaughtError = err => console.log(err);
process.on('unhandledRejection', LogUncaughtError);
process.on('uncaughtException', LogUncaughtError);

//List of all domains for SSL
const allDomains = [rmsDomain];

if(config.MODE === 'prod') {
    const getSecureContexts = () => {
        const certsToReturn = {};
        for(const domain of allDomains) {
            certsToReturn[domain] = tls.createSecureContext({
                key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8'),
                cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/cert.pem`, 'utf8'),
                ca: fs.readFileSync(`/etc/letsencrypt/live/${domain}/chain.pem`, 'utf8'),
            });
        }
        return certsToReturn;
    }
    
    const secureContexts = getSecureContexts()
    
    const options = {
        SNICallback: (servername, cb) => {
            const ctx = secureContexts[servername];
            if(cb) cb(null, ctx);
            else return ctx;
        },
    };

    https.createServer(options, app).listen(443);
    http.createServer(app).listen(8000,()=>{
        console.log('Server is running on port 8000.');
    });
} else {
    // http.createServer(app).listen(2083,()=>{
    //     console.log('Server is running on port 2083.');
    // });
    app.listen(2083,()=>{
        console.log('Server is running on port 2083.');
    });
}
