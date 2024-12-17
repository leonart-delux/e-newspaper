import express from 'express';
import { engine } from 'express-handlebars';
import hbs_section from 'express-handlebars-sections';
import session from 'express-session';
import passport from './middlewares/passport.js';
import dotenv from 'dotenv';

import authRouter from './routes/auth.route.js';

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'SECRET_KEY',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}));

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: './views/layouts',
    helpers: {
        format_number(value) {
          return numeral(value).format('0,0') + ' vnd';
        },
        section: hbs_section(),
      }
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/static', express.static('static'));
app.use(passport.initialize());
app.use(passport.session());

// Middleware Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRouter);

app.listen(3000, function () {
    console.log('Server started on http://localhost:3000/login-register');
});