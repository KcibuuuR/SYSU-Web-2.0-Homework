'use strict';

var
  fs = require('fs'),
  http = require('http'),
  url = require('url'),
  querystring = require('querystring'),
  renderTemplate = require('./template.js');
const domain = 'http://127.0.0.1';
const port = 9708;


var queryParse = (_url) => {
  return querystring.parse(url.parse(_url).query);
}

/*
  userData.json 储存格式：
    {
      'username1': {
        'studentID': s1,
        'phone': p1,
        'email': e1
      },
      'username2': {
        'studentID': s2,
        'phone': p2,
        'email': e2
      }
    }
*/

var signUp = (req, res) => {
  // 获取参数
  // 不知道“参数”除了我所需要的从 form POST 过来的数据以外还有什么东西；
  var allData = '';
  req.on('data', (chunk) => {
    allData += chunk;
  });
  // 参数获取完毕后会自动触发 end 事件；
  req.on('end', () => {
    // 将字符串转换为一个对象
    var dataString = allData.toString();
    // 将字符串转换为 JSON 对象
    var newUserData = querystring.parse(dataString);

    // 读取保存已注册用户数据的文件；
    fs.readFile('userData.json', 'utf-8', (err, rawData) => {
      // 将从文件读到的数据转成 JSON 对象
      // 若为读到的数据为空，需初始化为 '{}'，即 JSON 格式的空；
      if (!rawData) {
        rawData = '{}';
      }
      // 将不知道什么格式的 rawData 转化成...忘了是啥；
      var data = JSON.parse(rawData);
      // 获取重复键
      var duplicatedKey = validateUnique(newUserData, data);
      // 获取格式错误的键
      var wrongFormatKey = validateFormat(newUserData);
      if (duplicatedKey.length === 0 && wrongFormatKey.length === 0) {
        // 没有重复键及格式错误键，将创建新用户
        // 在 data 里插入新键值对
        // 将整个文件读出来，添加新键值对后又整个文件写回去，感觉效率有点低，不知能否优化；
        data[newUserData.username] = {
          'studentID': newUserData.studentID,
          'phone': newUserData.phone,
          'email': newUserData.email
        }
        // 将更新后的 data 写入文件
        fs.writeFile('userData.json', JSON.stringify(data), (err) => {
          // 这句话我也不知道是干嘛的，可能可以记录 error 吧 -。-
          console.error(err);
        });
        // 注册成功，重定向到用户详情界面；
        // 重定向地址默认为： http://127.0.0.1:9708?username=xxx/
        // 不知道为啥老师提供的格式在 端口9708 和 ? 直接不需要 / 
        res.writeHead(302, {
          'Location': domain + ':' + port + '?username=' + newUserData.username,
        });
        res.end();
      } else {
        console.log(duplicatedKey, wrongFormatKey);
        // 有重复键或格式错误键，创建新用户失败，将返回注册界面并提示错误信息；
        // 将错误信息保存到字符串变量里；
        var duplicatedStr = duplicatedKey.reduce((a, b) => a + '@' + b, '');
        var wrongFormatStr = wrongFormatKey.reduce((a, b) => a + '@' + b, '');
        console.log(duplicatedStr, wrongFormatStr);
        // 将已填写的用户数据和错误信息作为 querystring 传回原注册页面；
        // 若以后扩展到需要输入密码，应该不能将密码也返回，因为重定向是 GET ，不安全；
        var queryStr = '?username=' + newUserData.username + '&studentID=' + newUserData.studentID + '&phone=' + newUserData.phone + '&email=' + newUserData.email + '&dstr=' + duplicatedStr + '&wstr=' + wrongFormatStr;
        res.writeHead(302, {
          'Location': domain + ':' + port + '/signup' + queryStr,
        });
        res.end();
      }
    })
  })
}

/*
  database: JSON对象，已有用户；
  newData: JSON对象，新注册用户；
  @return: 新用户与已有用户重复的键；
*/
var validateUnique = (newData, database) => {
  var invalidKey = [];
  if (database[newData.username]) {
    invalidKey.push('username');
  }
  var t = 0;
  for (let user in database) {
    if (database[user].studentID == newData.studentID) {
      invalidKey.push('studentID');
      ++t;
    }
    if (database[user].phone == newData.phone) {
      invalidKey.push('phone');
      ++t;
    }
    if (database[user].email == newData.email) {
      invalidKey.push('email');
      ++t;
    }
    if (t === 3) {
      break;
    }
  }
  return invalidKey;
}
var validateFormat = (user) => {
  var ret = [];
  if (!validateUsernameFormat(user.username)) {
    ret.push('username');
  }
  if (!validateStudentIdFormat(user.studentID)) {
    ret.push('studentID');
  }
  if (!validatePhoneFormat(user.phone)) {
    ret.push('phone');
  }
  if (!validateEmailFormat(user.email)) {
    ret.push('email');
  }
  return ret;
}
var validateUsernameFormat = (username) => {
  return /^[a-z]\w{5,17}$/.test(username.toLowerCase());
}
var validateStudentIdFormat = (id) => {
  return /^[1-9]\d{7}$/.test(id);
}
var validatePhoneFormat = (phone) => {
  return /^[1-9]\d{10}$/.test(phone);
}
var validateEmailFormat = (email) => {
  return /^[a-zA-z_\-]+@(([a-zA-Z_\-])+\.)+[a-zA-Z]{2,4}$/.test(email);
}


// console.log(2, req.url);
// console.log(3, queryParse(req.url));
// signUp(req, res);

// $('#username').val(qstr.username);
// $('#studentID').val(qstr.studentID);
// $('#phone').val(qstr.phone);
// $('#email').val(qstr.email);
// $('li').toggle();
// let dKeys = qstr.dstr.split('@').filter((x) => x !== '');
// for (let dKey in dKeys) {
//   $('#d' + dKey).toggle();
// }
// let wKeys = qstr.wstr.split('@').filter((x) => x !== '');
// for (let wKey in wKeys) {
//   $('#w' + wKey).toggle();
// }        

var showWrongMsgScript = (dMsg, wMsg) => {
  var code = '<script>$(()=>{';
  for (let i in dMsg) {
    code += '$("#d' + dMsg[i] + '").show();';
  }
  for (let i in wMsg) {
    code += '$("#w' + wMsg[i] + '").show();';
  }
  code += '});</script>';
  console.log(code);

  return code;
}

http.createServer((req, res) => {
  console.log(req.url);
  if (req.url.toLocaleLowerCase().startsWith('/signup')) {
    if (req.method.toLocaleLowerCase() === 'post') {
      signUp(req, res);
    } else if (req.method.toLocaleLowerCase() === 'get') {
      var qstr = queryParse(req.url);
      console.log(qstr);
      if (JSON.stringify(qstr) !== '{}') {
        let dKeys = qstr.dstr.split('@').filter((x) => x !== '');
        let wKeys = qstr.wstr.split('@').filter((x) => x !== '');
        let code = showWrongMsgScript(dKeys, wKeys);
        fs.readFile('signUp.html', 'utf-8', (err, data) => {
          res.end(renderTemplate(data, { 'scriptInHead': code }));
        });
      } else {
        fs.readFile('signUp.html', 'utf-8', (err, data) => {
          res.end(renderTemplate(data, {}));
        });
      }
    }
  } else if (req.url.toLowerCase().startsWith('/?username=')) {
    getUserProfile(req, res);
  } else if (req.url.toLowerCase().startsWith('/static')) {
    // 获取 js 、 css 、 img 等静态文件；
    getStaticFile(req, res);
  } else {
    redirectToSignUp(req, res);
  }
}).listen(port);

var redirectToSignUp = (req, res) => {
  res.writeHead(302, {
    'Location': domain + ':' + port + '/signup',
  });
  res.end();
}
var getStaticFile = (req, res) => {
  let path = '.' + req.url;
  console.log('getting static file path: ', path);
  // 图片不能用 utf-8 格式读
  // 按下面这样写好像只能读取小图片，不过对这个作业够用了；
  if (path.endsWith('png')) {
    fs.readFile(path, (err, data) => {
      res.writeHead(200, {
        'Content-Type': 'image/png',
      });
      res.end(data);
    })
  } else {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (path.endsWith('css')) {
        res.writeHead(200, {
          'Content-Type': 'text/css',
        });
      } else if (path.endsWith('js')) {
        res.writeHead(200, {
          'Content-Type': 'application/x-javascript',
        });
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/plain',
        });
      }
      res.end(data);
    });
  }
}

var getUserProfile = (req, res) => {
  let username = queryParse(req.url).username;
  console.log(username);
  if (typeof (username) !== 'undefined' && username != '') {
    // 用户名合法，搜索数据库（文件）看该用户是否已注册；
    fs.readFile('userData.json', 'utf-8', (err, data) => {
      let obj = JSON.parse(data);
      if (typeof (obj[username]) !== 'undefined') {
        // 用户已注册，读取用户详情；
        let user = {};
        user.username = username;
        user.studentID = obj[username].studentID;
        user.phone = obj[username].phone;
        user.email = obj[username].email;
        console.log(user);
        fs.readFile('profile.html', 'utf-8', (err, data) => {
          res.writeHead(200, {
            'Content-Type': 'text/html',
          });
          console.log('render profile');
          res.end(renderTemplate(data, user));
        });
      } else {
        // 若用户名为空或该用户不存在，则重定向到注册界面；
        redirectToSignUp(req, res);
      }
    });
  } else {
    // 若用户名为空或该用户不存在，则重定向到注册界面；
    redirectToSignUp(req, res);
  }
}