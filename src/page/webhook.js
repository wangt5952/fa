

module.exports = {
  'coding.post': (req, res, next) => {

    const codingEvent = req.headers['x-coding-event'];
    if(codingEvent == 'push'){
      const { spawn } = require('child_process');
      spawn('./sh/coding.push.sh');
    }
    res.send('post');
  },
}
