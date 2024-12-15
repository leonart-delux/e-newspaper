import express from 'express';
import { engine } from 'express-handlebars';
import hbs_section from 'express-handlebars-sections';
import session from 'express-session';

import authRouter from './routes/auth.route.js';

const app = express();

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: './views/layouts',
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/static', express.static('static'));

app.use('/', authRouter);

app.listen(3000, function () {
    console.log('Server started on http://localhost:3000');
});