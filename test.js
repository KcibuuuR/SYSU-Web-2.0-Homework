'use strict';

var
  fs = require('fs'),
  http = require('http'),
  url = require('url'),
  querystring = require('querystring');

const domain = 'http://127.0.0.1';
const port = '9708';


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
  var allData = '';
  req.on('data', (chunk) => {
    allData += chunk;
  });
  req.on('end', () => {
    // 将字符串转换为一个对象
    var dataString = allData.toString();
    // 将字符串转换为 JSON 对象
    var newUserData = querystring.parse(dataString);

    fs.readFile('userData.json', 'utf-8', (err, rawData) => {
      // 将从文件读到的数据转成 JSON 对象
      // 若为读到的数据为空，需初始化为 '{}'，即 JSON 格式的空；
      if (!rawData) {
        rawData = '{}';
      }
      var data = JSON.parse(rawData);
      // 获取重复键
      var duplicatedKey = validateUnique(newUserData, data);
      // 获取格式错误的键
      console.log(newUserData);
      var wrongFormatKey = validateFormat(newUserData);
      if (duplicatedKey.length === 0 && wrongFormatKey.length === 0) {
        // 没有重复键及格式错误键，将创建新用户
        // 在 data 里插入新键值对
        data[newUserData.username] = {
          'studentID': newUserData.studentID,
          'phone': newUserData.phone,
          'email': newUserData.email
        }
        console.log(data);
        // 将更新后的 data 写入文件
        fs.writeFile('userData.json', JSON.stringify(data), (err) => {
          console.error(err);
        });
        // 注册成功，重定向到用户详情界面；
        console.log('before 302')
        res.writeHead(302, {
          'Location': 'http://127.0.0.1:9708/profile'
        });
        res.end();
      } else {
        console.log(duplicatedKey, wrongFormatKey);
        // 有重复键或格式错误键，创建新用户失败，将返回注册界面并提示错误信息
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

http.createServer((req, res) => {
  if (req.url.toLocaleLowerCase() === '/signup') {
    signUp(req, res);
  } else {
    ;
  }
  res.writeHead(200, {
    'Content-Type': 'text/plain',
  });
  res.end('hello there');
}).listen(9708);

