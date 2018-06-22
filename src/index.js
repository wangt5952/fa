import express from 'express';
import bodyParser from 'body-parser';

const app = express();

require('./config/view')(app);

app.use(bodyParser.urlencoded({extended:true,limit: '5mb'}))
app.use(bodyParser.json())
app.use(express.static('public'))

require('./config/session')(app);
require('./router')(app);

app.listen(9056);
