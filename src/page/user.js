import config from '../config';
const knex = require('knex')(config.db)

import _ from 'lodash';
import moment from 'moment';

import authList from '../config/auth';
import nodemailer from 'nodemailer';
import XLSX from 'xlsx';

module.exports = {
  '.get': async (req, res, next) => {
    let { ...session } = req.session;

    let { user_id } = session;
    if(!user_id){
      res.redirect('/user/login');
      return;
    }

    let appList = await knex('v_sys_user_app').where({user_id});
    res.render('template/user/index.html', {appList, session});
  },
  'login.post': async (req, res, next) => {
    let { username, password } = req.body;
    let { unknow_process = [] } = req.session;

    if(!username || !password) {
      res.json({errno:1, errmsg:'请输入账号和密码'})
      return;
    }

    let user, home;
    if(username == 'admin' && password == '123456'){
      user = {
        id: 0,
        name:'超级管理员',
        auth: _.map(authList, 'code').join(',')
      }
      home = '/sys/user';
    }else{
      user = await knex('sys_user').where({username, password}).first();
      home = '/';
    }

    if(!user){
      res.json({errno:1, errmsg:'账号或密码错误'})
      return;
    }

    if(user.id && unknow_process.length){
      await knex('fa_process').whereIn('id', unknow_process).update({user_id:user.id});
      req.session.unknow_process = [];
    }


    req.session.user_id = user.id;
    req.session.user_name = user.name || user.username;
    req.session.authMap = _.mapKeys((user.auth || '').split(','))
    await req.session.save();

    res.json({data:{home}})
  },

  'logout.get': async (req, res, next) => {
    req.session.destroy(()=>{
      res.redirect('/');
    })
  },

  'password.post': async (req, res, next) => {
    const { old_password, new_password, new_password2 } = req.body;

    let { user_id } = req.session;
    if(!user_id){
      res.json({errno:1, errmsg:'不能修改此用户密码'})
      return;
    }

    if(!new_password){
      res.json({errno:1, errmsg:'新密码不能为空'})
      return;
    }

    if(new_password != new_password2){
      res.json({errno:1, errmsg:'输入的两次新密码不一致'})
      return;
    }

    let user = await knex('sys_user').where({id:user_id, password:old_password}).first();
    if(!user){
      res.json({errno:2, errmsg:'旧密码错误'})
      return;
    }

    await knex('sys_user').where({id:user_id}).update({password:new_password});
    res.json({})
  },

  'join.post': async (req, res, next) => {
    const { username, password, password2 } = req.body;
    let { unknow_process = [] } = req.session;

    if(!username){
      res.json({errno:1, errmsg:'用户名不能为空'})
      return;
    }
    if(!password){
      res.json({errno:2, errmsg:'密码不能为空'})
      return;
    }
    if(password != password2){
      res.json({errno:3, errmsg:'两次密码不一致'})
      return;
    }

    let user = await knex('sys_user').where({username}).first();
    if(user){
      res.json({errno:1, errmsg:'账号已存在'})
      return
    }

    let user_id = await knex('sys_user').returning('id').insert({username, password});
    user_id = user_id[0];

    if(user_id && unknow_process.length){
      await knex('fa_process').whereIn('id', unknow_process).update({user_id});
      req.session.unknow_process = [];
      await req.session.save();
    }
    res.json({})
  },

  'home.get': async (req, res, next) => {
    let { user_id } = req.session;
    if(!user_id){
      res.redirect('/user/login');
      return;
    }

    let processList = await knex('fa_process').where({user_id});
    res.render('template/user/home.html', {processList});
  },

  'info.get': async (req, res, next) => {

    let { ...session } = req.session;
    let { user_id } = session;

    let item = await knex('sys_user').where({id:user_id}).first();
    res.render('template/user/info.html', {item, session});
  },

  'info.post': async (req, res, next) => {

    let { user_id } = req.session;

    let data = req.body;

    if(user_id){
      await knex('sys_user').where({id:user_id}).update(data);
    }

    res.json({})
  },

  'email_edit.post': async (req, res, next) => {
    let { email } = req.body;

    let { user_id } = req.session;

    let protocol = req.protocol;
    let hostname = req.protocol == 'http' ? req.hostname + ':9056' : req.hostname;
    const ts = moment().unix();
    let code = new Buffer(`${user_id}:${email}:${ts}`).toString('base64')
    let tran = nodemailer.createTransport(config.email)
    let data = {
      from:config.email.auth.user,
      to: email,
      subject: '邮箱设置',
      html: `点击<a href="${protocol}://${hostname}/user/email_finish?code=${code}">这里</a>完成邮箱设置`
    }
    let info = await new Promise((resolve, reject)=>{
      tran.sendMail(data, (err, info)=>{
        if(err) reject(err); else resolve(info)
      })
    })

    res.json({})
  },

  'email_finish.get': async (req, res, next) => {
    let { code } = req.query;
    let [user_id, email, ts] = (new Buffer(code, 'base64').toString()).split(':');

    await knex('sys_user').where({id:user_id}).update({email:email});
    res.redirect('info');
  },

  'template.get': async (req, res, next) => {
    let { ...session } = req.session;
    const { user_id, authMap } = session;
    if(req.xhr){
      let { draw, columns, order, start, length, search, _:ts } = req.query;
      let dao = knex('fa_template').where({user_id});
      let daoCount = knex('fa_template').where({user_id});

      if(order.length){
        const { column, dir } = order[0];
        dao.orderBy(columns[column].data, dir);
      }

      if(search.value){
        _.forEach([dao, daoCount], dao=>{
          _.forEach(search.value.split(' '), key=>{
            if(key){
              dao.where(d=>{
                d.where('name', 'like', `%${key}%`)
              })
            }
          })
        })
      }

      dao.offset(Math.max(0, start)).limit(Math.max(10, length));

      let list = await dao;
      list = _.map(list, o=>({
        ...o,
        create_time: moment(o.create_time).format('lll')
      }))
      let total = (await daoCount.count('* as cnt'))[0].cnt;

      res.json({
        recordsTotal:total,
        recordsFiltered:total,
        data:list
      })
    }else{
      res.render('template/user/template.html', {session});
    }
  },

  'template_edit.get': async (req, res, next) => {
    let { id } = req.query;
    let { ...session } = req.session;

    let { user_id } = session;

    let tableNameList = await knex('sys_config').where('name', 'fa_table_field').first() || {};
    tableNameList = _.filter(_.map(tableNameList.value.split('\r\n\r\n'), o=>_.compact(o.split('\r\n'))), o=>_.size(o));
    tableNameList = _.map(tableNameList, o=>o[0]);

    let item = id ? await knex('fa_template').where({id}).first() : {};

    item.table_config = item.table_config ? JSON.parse(item.table_config) : [];

    let file = await knex('sys_file').where({id:item.file_id}).first();
    let xfile = XLSX.readFile(file.path);

    let template_info = _.map(xfile.Sheets, (o, name)=>{

      let ref = XLSX.utils.decode_range(o['!ref'])
      let merges = o['!merges'];
      let cells = [
        ..._.map(_.filter(_.keys(o), k=>k.match(/([A-Z]+)(\d+)/)), XLSX.utils.decode_cell),
        ..._.map(merges, 's'),
        ..._.map(merges, 'e')
      ]

      let e = {
        r: _.maxBy(cells, 'r').r+1,
        c: _.maxBy(cells, 'c').c+1
      }

      let table = _.map(_.range(ref.s.r, e.r), r=>_.map(_.range(ref.s.c, e.c), c=>{
        let address = XLSX.utils.encode_cell({c,r});
        let cell = o[address]
        return {
          v:cell ? cell.v : '',
          address
        }
      }))

      _.forEach(merges, ({s, e})=>{
        if(s.c != e.c) table[s.r][s.c].colspan = ` colspan="${e.c - s.c + 1}" `;
        if(s.r != e.r) table[s.r][s.c].rowspan = ` rowspan="${e.r - s.r + 1}" `;
        let x, y;
        for(x = s.r; x <= e.r; x++){
          for(y = s.c; y <= e.c; y++){
            if(x != s.r || y != s.c){
              table[x][y].hide = true;
            }
          }
        }
      })



      return {
        table,
        name,
        ...o
      }
    });

    //console.dir(table_config);

    res.render('template/user/template_edit.html', {item, template_info, tableNameList, session});
  },

  'template_edit.post': async (req, res, next) => {
    let { table_config=[], ...data} = req.body;
    let { id, act } = req.query;
    let { user_id } = req.session;

    console.log(JSON.stringify(table_config))

    if(act != 'del'){
      data.table_config = JSON.stringify(table_config);
    }


    if(id){
      if(act == 'del'){
        await knex('fa_template').where({id}).delete();
      }else{
        await knex('fa_template').where({id}).update(data);
      }
    }else{
      let { file_id } = data;
      let file = await knex('sys_file').where({id:file_id}).first();
      let name = data.name || file.original_name;
      id = await knex('fa_template').returning('id').insert({
        ...data,
        name,
        user_id
      });
      id = id[0]
    }
    res.json({data:{id}})
  },
}
