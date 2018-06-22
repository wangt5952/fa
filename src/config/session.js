import session from 'express-session';
import SessionFileStore from 'session-file-store';

module.exports = app => {
  app.use(session({
    store: new (SessionFileStore(session))({path:'./runtime/session'}),
    secret:'ngsyun.com',
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
  }))
}
