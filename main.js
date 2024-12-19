import connectLiveReload from 'connect-livereload'
import hbs_section from 'express-handlebars-sections';
import livereload from 'livereload';
import session from "express-session";
import express from "express";
import path from 'path';

import passport from './middlewares/passport.js';
import dotenv from 'dotenv';

import {engine} from "express-handlebars";
import {dirname} from "path";
import {fileURLToPath} from "url";

import helper from './utils/helper.js';
import { isAuth, isWriter } from './middlewares/auth.mdw.js';

import accountRoute from "./routes/account.route.js";
import authRouter from './routes/auth.route.js';
import writerRouter from './routes/writer.route.js';
import categoryRoute from "./routes/category.route.js";
import articleRoute from "./routes/article.route.js";

import {getVipUser} from "./middlewares/user.mdw.js";


// =================================================
//                  SERVER CONFIG
// =================================================

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 1);
});

dotenv.config();
const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'SECRET_KEY',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(connectLiveReload());
// Middleware Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/static', express.static('static'));
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/others', express.static(path.join(__dirname, '/static/images/others')));


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


// =================================================
//                  SERVER ROUTING
// =================================================

app.use('/', articleRoute);
app.use('/account', getVipUser, accountRoute);
app.use('/category', categoryRoute);
app.use('/', authRouter);
app.use('/writer', isAuth, isWriter, writerRouter);

app.listen(3000, function () {    
    console.log("Server started on http://localhost:3000");
});