import connectLiveReload from 'connect-livereload'
import hbs_section from 'express-handlebars-sections';
import livereload from 'livereload';
import session from "express-session";
import express from "express";
import path from 'path';

import {engine} from "express-handlebars";
import {dirname} from "path";
import {fileURLToPath} from "url";

import helper from './utils/helper.js';

import accountRoute from "./routes/account.route.js";
import authRouter from './routes/auth.route.js';
import writerRouter from './routes/writer.route.js';


// =================================================
//                  SERVER CONFIG
// =================================================
const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 1);
});

var app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'SECRET_KEY',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

app.use('/static', express.static('static'));
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: './views/layouts',
    helpers: {
        formatSimpleDatetime: helper.formatSimpleDatetime,
        section: hbs_section(),
    },
}));

app.set("view engine", "hbs");
app.set("views", "./views");

app.use(connectLiveReload());
app.use(express.urlencoded({
    extended: true,
}));
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/others', express.static(path.join(__dirname, '/static/images/others')));

// =================================================
//                  SERVER ROUTING
// =================================================
app.use('/', authRouter);
app.use('/account', accountRoute);
app.use('/writer', writerRouter);

app.listen(3000, function () {
    console.log("Server started on http://localhost:3000");
});
