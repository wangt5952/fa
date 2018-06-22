import _ from 'lodash';

import config from '../config';
const knex = require('knex')(config.db)

import fs from 'fs';


module.exports = {
  'upload.postFile': async (req, res, next) => {


    let ids = await knex('sys_file').returning('id').insert(_.map(req.files, o=>({
      original_name: o.originalname, encoding: o.encoding, mime_type: o.mimetype,
      destination: o.destination, file_name: o.filename, path: o.path, size: o.size
    })))

    res.json({data:ids})
  },
  'download.get': async (req, res, next) => {
    let { file_id } = req.query;

    let file = await knex('sys_file').where({id:file_id}).first();

    res.attachment(file.original_name)
    fs.createReadStream(file.path).pipe(res);
  }
}
