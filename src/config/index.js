const port = __dirname.indexOf('/www') == 0 ? 3996 : 3306

export default {
  db: {
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port,
      user : 'fa',
      password : '11223344',
      database : 'fa'
    },
  },

  gt: {
    geetest_id: 'ef1d13b11e3ec2b0ff7d0ba7e973916c',
    geetest_key: '472732b2ac27d98b7a0aa29195481129'
  },

  email: {
    secureConnection: true,
    host:'smtp.exmail.qq.com',
    auth: {
      user: 'service@ngsyun.com',
      pass: 'Asd123456'
    }
  }
}
