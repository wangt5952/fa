import nunjucks from 'nunjucks';

module.exports = app => {
  let env = nunjucks.configure('views', {
    autoescape: true,
    watch: true,
    express: app,
  });
}
