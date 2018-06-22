import config from '../config';
const knex = require('knex')(config.db)

import moment from 'moment';
moment.locale('zh-cn');
import _ from 'lodash';
import authList from '../config/auth';

module.exports = {
  'process.get': async (req, res, next) => {
    let { ...session } = req.session;
    const { authMap } = session;
    if(req.xhr){
      let { draw, columns, order, start, length, search, _:ts } = req.query;
      let dao = knex('v_fa_process');
      let daoCount = knex('fa_process');

      if(order.length){
        const { column, dir } = order[0];
        dao.orderBy(columns[column].data, dir);
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
      res.render('template/sys/process.html', {session});
    }
  },

  'process_edit.post': async (req, res, next) => {
    let data = req.body;
    let { id, act } = req.query;

    if(id){
      if(act == 'del'){
        await knex('fa_process').where({id}).delete();
      }else{
        await knex('fa_process').where({id}).update(data);
      }
    }else{
      await knex('fa_process').insert(data);
    }
    res.json({})
  },

  'process_feedback.get': async (req, res, next) => {
    let { ...session } = req.session;
    const { authMap } = session;
    if(req.xhr){
      let { draw, columns, order, start, length, search, _:ts } = req.query;
      let dao = knex('fa_process_feedback');
      let daoCount = knex('fa_process_feedback');

      if(order.length){
        const { column, dir } = order[0];
        dao.orderBy(columns[column].data, dir);
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
      res.render('template/sys/process_feedback.html', {session});
    }
  },

  'process_feedback_edit.get': async (req, res, next) => {
    let { id } = req.query;
    let { ...session } = req.session;

    let item = id ? await knex('fa_process_feedback').where({id}).first() : {};

    res.render('template/sys/process_feedback_edit.html', {item, session});
  },

  'process_feedback_edit.post': async (req, res, next) => {
    let data = req.body;
    let { id, act } = req.query;

    if(id){
      if(act == 'del'){
        await knex('fa_process_feedback').where({id}).delete();
      }else{
        await knex('fa_process_feedback').where({id}).update(data);
      }
    }else{
      await knex('fa_process_feedback').insert(data);
    }
    res.json({})
  },

  'user.get': async (req, res, next) => {
    let { ...session } = req.session;
    const { authMap } = session;
    if(req.xhr){
      let { draw, columns, order, start, length, search, _:ts } = req.query;
      let dao = knex('sys_user');
      let daoCount = knex('sys_user');

      if(order.length){
        const { column, dir } = order[0];
        dao.orderBy(columns[column].data, dir);
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
      res.render('template/sys/user.html', {session});
    }
  },

  'user_edit.get': async (req, res, next) => {
    let { id } = req.query;
    let { ...session } = req.session;
    const { authMap } = session;

    let item = id ? await knex('sys_user').where({id}).first() : {};

    item.authMap = _.mapKeys((item.auth || '').split(','))

    let clerkList = await knex('sys_user');
    res.render('template/sys/user_edit.html', {item, clerkList, authList, session});
  },

  'user_edit.post': async (req, res, next) => {
    let { set_password, password, ...data} = req.body;
    let { id, act } = req.query;

    if(set_password) data.password = password;
    if(data.auth) data.auth = data.auth.join(',');

    if(id){
      if(act == 'del'){
        await knex('sys_user').where({id}).delete();
      }else{

        if(data.username){
          const user = await knex('sys_user').where({username:data.username}).whereNot({id}).first();
          if(user){
            res.json({errno:1,errmsg:'登录账号已存在'})
            return;
          }
        }
        await knex('sys_user').where({id}).update(data);
      }
    }else{

      if(data.username){
        const user = await knex('sys_user').where({username:data.username}).first();
        if(user){
          res.json({errno:1,errmsg:'登录账号已存在'})
          return;
        }
      }

      await knex('sys_user').insert(data);
    }
    res.json({})
  },


  'examine.get': async (req, res, next) => {
    let { ...session } = req.session;
    const { authMap } = session;
    if(req.xhr){
      let { draw, columns, order, start, length, search, _:ts } = req.query;
      let dao = knex('fa_examine');
      let daoCount = knex('fa_examine');

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
                  .orWhere('content', 'like', `%${key}%`)
              })
            }
          })
        })
      }

      dao.offset(Math.max(0, start)).limit(Math.max(10, length));

      let list = await dao;
      list = _.map(list, o=>({
        ...o,
        name: o.name || o.default_name,
        create_time: moment(o.create_time).format('lll')
      }))
      let total = (await daoCount.count('* as cnt'))[0].cnt;

      res.json({
        recordsTotal:total,
        recordsFiltered:total,
        data:list
      })
    }else{
      res.render('template/sys/examine.html', {session});
    }
  },

  'examine_edit.get': async (req, res, next) => {
    let { id } = req.query;
    let { ...session } = req.session;

    let item = id ? await knex('fa_examine').where({id}).first() : {};

    res.render('template/sys/examine_edit.html', {item, session});
  },

  'examine_edit.post': async (req, res, next) => {
    let data = req.body;
    let { id, act } = req.query;

    let config = await knex('sys_config').where('name', 'fa_table_field').first() || {};
    config = _.filter(_.map(config.value.split('\r\n\r\n'), o=>_.compact(o.split('\r\n'))), o=>_.size(o));


    if(data && data.content){
      data.default_name = data.content;
      _.forEach(_.map(config, o=>o[0]), o=>{
        data.default_name = data.default_name.replace(new RegExp(o+'[.]', 'g'), '');
      })
    }

    if(id){
      if(act == 'del'){
        await knex('fa_examine').where({id}).delete();
      }else{
        await knex('fa_examine').where({id}).update(data);
      }
    }else{
      await knex('fa_examine').insert(data);
    }
    res.json({})
  },


  'fa_table_field.get': async (req, res, next) => {

    let { ...session } = req.session;

    let item = await knex('sys_config').where('name', 'fa_table_field').first() || {};

    res.render('template/sys/fa_table_field.html', {item, session});
  },

  'fa_table_field.post': async (req, res, next) => {
    let {
      content
    } = req.body;

    let UpdateOrCreate = async (name, value) => {
      let ret = await knex('sys_config').where({name}).update({value})

      if(!ret){
        await knex('sys_config').insert({name, value})
      }
    }

    await UpdateOrCreate('fa_table_field', content);

    res.json({});
  },
}
