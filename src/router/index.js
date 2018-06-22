import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import multer from 'multer';
const upload = multer({dest: 'runtime/upload' });

const walkdirSync = dir => fs.readdirSync(dir).map(o=>{
  let filepath = path.join(dir,o);

  return fs.statSync(filepath).isDirectory()
    ? _.flatten(walkdirSync(filepath)).map(p=>path.join(o,p))
    : path.basename(o, path.extname(o));
})

const warp = fn => (...args) => {
  let result = fn(...args);

  if(result instanceof Promise){
    result.catch(args[2])
  }
}

module.exports = app => {

  let fileList = walkdirSync(path.join(__dirname, '..','page'));
  const routeObject = (obj, root, method='use')=>{
    if(_.isFunction(obj)){

      if(method == 'postFile'){
        method = 'post';
        app[method](root, upload.any(), warp(obj));
      }else{
        app[method](root, warp(obj));
      }

    }else{
      _.each(obj, (o, k)=>{
        let match = k.match(/\.(\w+)$/);
        let method;
        if(match){
          k = k.replace(match[0], '')
          method = match[1]
        }
        if(k){
          routeObject(o, `${root}/${k}`, method)
        }else{
          routeObject(o, `${root}`, method)
        }
      })
    }
  }
  _.flatten(fileList).forEach(o=>{
    let p = require(['..','page',o].join(path.sep))
    routeObject(p, `/${o}`)
  });


  let dirList = _.pull(fs.readdirSync(__dirname), path.basename(__filename))
  _.forEach(dirList, o=>require(['.',o].join('/'))(app))

  app.get('/*', warp(async (req, res, next)=>{
    let { pathname } = req._parsedUrl;
    if(path.extname(pathname)){
      next();
      return;
    }

    let viewPath = path.join('template', pathname);
    if(_.endsWith(viewPath, '/')) viewPath = path.join(viewPath, 'index');

    let {cookie, ...session } = req.session;
    res.render(`${viewPath}.html`, {
      req:{
        query: req.query,
        body: req.body
      },
      session
    }, (err, html)=>{
      if(err){
        next();
      }else{
        res.send(html);
      }
    });
  }))

  app.use((err, req, res, next)=>{
    res.json({
      errno:'SYS_888',
      errmsg: err.message,
      data:err
    })
  })
}
