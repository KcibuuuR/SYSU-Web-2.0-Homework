- 注：以下代码需要导入 `fs` 、 `http` 、 `url` 、`querystring` 4个库（看不懂这句话的可以先跳过这句话）；
- 在动手写作业前，当然得先看看老师的课件以及了解基本的 `helloServer.js` 例子：
```javascript
// helloServer.js
/*
导入 Nodejs 自带的 http 库；
相当于 c++ 的 #include 语句；
*/
var http = require('http');
/*
这里要注意的有几点：
  0，箭头函数 (req, res) => {} 等同于 function (req, res) {}
  1，http.createServer(xxx)，此处的 xxx（即箭头函数)是一个“函数声明及定义”， 而不是“函数调用”。也就是说我们是“定义”一个函数并将其“作为实际参数”传进 createServer()函数；
  2，理解了上一点，也就很容易明白(request, response)括号里的 request 和 response 都是“新定义的函数的形参”，而不是“函数调用的实参”，所以不要问为什么没有定义 request 就能直接使用；
  3，nodejs 很多形如 http.createServer(xxx).listen(xxxx) 之类的 “链式调用”，因为前一个函数返回一个对象，进而使用该返回对象调用 .listen()；
*/
http.createServer((request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/plain',
  });
  // res.end() 函数将参数内容写入返回给浏览器的 html
  response.end('Hello World\n');
}).listen(9708);
```
- 在控制台运行 `nodejs helloServer.js` 后在浏览器输入`localhost:9708` 即可访问“动态生成”的 `html`，该 html 只有简单的一句 Hello World。
- 上面的例子只能返回同一个 `html`，即包含一句 `Hello World`  的网页，但是我们需要根据用户输入的 `url` 的不同而返回不同的 `html`，所以需先获取 `url`；
    - 我们在回调函数的函数体中用 `request.url` 即可获得 `url` 的字符串，需要注意的是该字符串没有包含域名和端口，也就是说 `http://localhost:9708` 的 `url` 为空，而 `http://localhost:9708/signup` 的`url` 为 `/signup`;
    - 获取了 `url` 之后，我们就可以根据 `url` 的不同返回不同的 `html` 了，比如：
    
```javascript

http.createServer((request, response) => {
  // 根据 url 不同调用不同的函数处理 request 和 response
  if (request.url == '/signup') {
    signup(request, response);
  } else if (request.url == '/username=kcibuuuR') {
    accessUserProfile('kcibuuuR', request, response);
  } else if (request.url == '/username=dongXY') {
    accessUserProfile('dongXY', request, response);
  } else {
    doSomething(request, response);
  }
}).listen(9708);
var signup = (req, res) => {
  // 在这里编写你的 Bug，然后把想返回给浏览器的字符串保存到某个变量如 ret 中；
  // 例如简单地返回一句话： var ret = '正在访问 signup 页面';
  // 处理完就调用 writeHead 和 end 函数；
  response.writeHead(200, {
    'Content-Type': 'text/plain',
  });
  res.end(ret);
}
var accessUserProfile = (username, req, res) => {
  // 也可以像这样定义函数，新增一个 username 形参，然后在 createServer 中记得传入相应的实参给它；
  response.writeHead(200, {
    'Content-Type': 'text/plain',
  });
  res.end('你这在访问 ' + username + ' 的用户详情页面');
}
var doSomething = (req, res) => { ; }


```
- 完成了 helloServer 例子后我们的目标就简单了，只需将返回的 "Hello World" 换成正常的 `html` 文件即可；
    - 要生成所谓“正常的 `html`”，我们可以想到两种方法：
        - 拼接字符串如 `res.end('<h1>用户注册</h1><form>......')` ；
        - 先准备好 `signup.html` 文件，将这个文件读入 `varName` 变量，然后使用 `res.end(varName);` 即可返回整个 `html`；
    - 我们当然选第二种，所以就需要学习文件读写；
- `fs` 库文件读写
    - 我们暂时只需要学会 3 种用法；
    - `fs.readFile('fileName', (err, data) => { xxx });` 
        - 此函数接收两个参数，前者为文件路径及名称，如 `"./static/img/xxx.png"`，后者为一个回调函数；
        - `readFile()` 成功读取文件后，会将文件内容 “作为实参”传入回调函数的`data` 形参中并调用该回调函数。所以我们在定义回调函数编写函数体时，就是将 `data` 当做包含文件内容的字符串去看待；
        - 若文件读取出错，则会将错误传入 `err` 参数，不过我们现在暂时不考虑出错的情况，所以不用管它；
    - `fs.readFile('fileName', 'utf-8', (err, data) => {};`
        - 此用法与上面的不同之处就在于传入了一个新的实参 `'utf-8'`，这个参数将改变文件读取的编码，我一般用第一个函数读取图片，其他如 `html` 或 `json` 之类的文本文件则用 `'utf-8'` 编码读取，具体区别不清楚；
    - `fs.writeFile('fileName', dataStr, (err) => {};`
        -   此函数用以将字符串类型的 `dataStr` 写入文件；
        - 回调函数用以处理出错的情况，同样暂时不需要，所以函数体可以直接为空；
    - 掌握上面 3 种最基本的用法后，我们就可以读取 `html` 文件并用 `res.end()` 将文件内容返回给浏览器，也可以将浏览器发送过来的数据（如注册时提交的用户名、学号等）写入文件；

- 下面我们就可以开始动手写处理不同 `url` 的函数了，首先先写返回注册界面的函数 signUpGet;
    - 函数名的后缀 `Get` 代表我们编写函数是用来处理以 `GET` 方式访问 `/signup` 页面的，同样后面我们会编写 `signUpPost` 用来处理以 `POST` 方式访问的情况；
    - 我们先简单的返回一个注册页面就行：
    
```javascript

var signUpGet = (req, res) => {
  // 简单地读取 signUp.html 文件并将去返回给浏览器
  fs.readFile('signUp.html', 'utf-8', (err, data) => {
    res.end(data);
  });
}

```
- 在继续编写 `js` 代码前我们先看看这个 `signUp.html` 应该怎么编写；
    - 按作业要求我们需要在这个 `html` 中创建一个表单 form ，并且能将填入的内容以 `POST` 方式传给服务器，我们可以简单地这么写：
    
```html

<h1>用户注册界面</h1>
<form action='http://localhost:9708/signUpPost' method='post'>
    用户名<input type='text' name='username' />
    学号<input type='text' name='studentID' />
    手机<input type='text' name='phone' />
    邮箱<input type='text' name='email' />
</form>

```
- 上面的代码需要注意的有两点：
    - `<input>` 标签需要有 `name` 属性，我们传入到服务器的数据就要用到`name`属性来获取和区分不同`input`标签的值；
        - 我们知道 `input` 标签都有一个 `value` 属性，用以储存用户输入的值，所以可以理解为浏览器将 `name`的值（如上面的 `username` ）和 `value` 的值（如用户填写的 `kcibuuuR` ）作为一对键值对以某种形式传给服务器，然后在服务器的 `js` 代码中我们就可以用 `someDict['username']` 来获得 `'kcibuuuR'` 这个值；
   - `<form>` 标签需要有 `action` 属性和 `method` 属性;
        - `action` 代表按下“提交”按钮后将“携带”`name-value` 访问哪个 `url`，而我们上面说了，我们在 `createServer` 中用一堆 `if` 语句使得访问不同的 `url` 将会调用不同的函数，所以这些 `name-value` 键值对也会传入相应的函数的 `request` 形参中的某个属性中；
        - `method` 代表 `http` 访问链接的 `method`，这个我不熟悉，不过老师说要用 `POST` 那就用吧；
- 我们在上面的 `html` 中将 `action` 设置为 `.../signUpPost` ，现在我们来编写与这个 `url` 对应的 `signUpPost` 函数；
```javascript

var signUpPost = (req, res) => {
  // 下面一段代码在网上搜的稍微改一下，我也不太清楚，可能注释会有错误；
  // 我们需要先获取从 form POST 给服务器的数据，定义一个 allData 变量来储存它；
  var allData = '';
  // .on() 貌似属于 NodeJS 的 Event 部分的内容
  // 下面这句代码大概是说每次 req 触发 data 事件，会把某些东西传入回调函数的 chunk 参数中
  // 然后我们在回调函数的函数体将这些“某些东西”全扔到 allData 字符串中就行了；
  req.on('data', (chunk) => {
    allData += chunk;
  });
  // 所有数据获取完毕后会自动触发 end 事件，从而调用我们在 .end() 参数列表中定义的回调函数；
  req.on('end', () => {
    // allData 是我也不知道是什么格式的数据；
    // 通过下面两句代码它就 somehow 变成我们上面说的 name-value 键值对，即 对象、字典、map 之类的，随便你叫什么；
    var dataString = allData.toString();
    var someDict = querystring.parse(dataString);
    // 从上一行代码开始我们就可以通过 someDict['phone'] 获取用户在表单中填入的手机号码了；
    // 获取到这些键值对后，我们需要检验其格式以及是否与已注册用户重复;
    // 我们先读入储存已注册用户数据的 userData.json 文件;
    fs.readFile('userData.json', 'utf-8', (err, rawData) => {
      // 我们是以 json 格式储存已注册用户数据，所以文件数据后（此时读取到的 rawData 应该是类似字符串的东西）
      // 我们可以调用 JSON 相关的函数将字符串转化成 键值对；
      if (!rawData) { rawData = '{}' } // 如果文件为空，则将其转化成 '{}'，这样调用 JSON 的函数时才不会出错；
      var data = JSON.parse(rawData);
      // 现在我们有了所有已注册用户的数据以及从 form 传过来的新用户数据
      // 可以进行格式错误及信息重复的检验了，我们把这两个任务分配给另外两个函数来完成；
      // 只要能完成"检验"的需求就行，具体实现细节因人而异；
      // 在这里我将两个函数的返回值均设置为“不合格的键的列表”
      // 比如如果用户名和学号格式错误，那 wrongFormatKey == ['username', 'studentID'];
      var wrongFormatKey = validateFormat(someDict);
      var duplicatedKey = validateUnique(someDict);
      // 若所有信息不出错也不重复，那就可以创建新用户了；
      // yourCondition 根据不同实现而异；
      if (yourCondition) {
        // 创建新用户需要 新用户数据 someDict，现有用户数据 data 及 req 和 res 等；
        createNewUser(someDict, data, req, res);
      } else {
        // 创建失败，则返回注册界面；
        // 因为需要提示用户注册失败的原因，所以我们要把错误的键也作为实参传递；
        redirectToSignup(wrongFormatKey, duplicatedKey, req, res);
      }
    })
  })
}


```
- 编写完 `signUpPost` 之后我们还要完成里面的另外4个函数：`validateFormat()` 和 `createNewUser()` 等等；
- 在 `createNewUser()` 中我们需要将新用户写入文件，并让浏览器跳转到用户详情界面即 `localhost:9708/?username=kcibuuuR`；
    - 一种实现方案如下：
    
``` javascript

var createNewUser = (newUserData, data, req, res) => {
  // 上面说了 data 是一个 JSON 对象，所以可以直接插入新键值对；
  data[newUserData.username] = {
    'studentID': newUserData.studentID,
    'phone': newUserData.phone,
    'email': newUserData.email
  }
  // 将更新后的 data 写入文件
  fs.writeFile('userData.json', JSON.stringify(data), (err) => { });
  // 注册成功，重定向到用户详情界面；
  // 重定向我也不熟，不过这样写反正没问题就是喽，只需要两行代码；
  res.writeHead(302, {
    'Location': 'http://localhost:9708/?username=' + newUserData.username
  });
  res.end();
}


```
- 注册失败需要返回注册页面，如果不需要提示错误信息那比较简单，只需要用两行重定向代码定向到 `localhost:9708/signup` 就行了，若按作业要求则需要提示错误信息，比较麻烦，先编写别的；
- 注册成功我们会跳转到用户详情界面，例如 `http://localhost:9708/?username=kcibuuuR`，所以在 `http.createServer()` 为此新增一条 `if` 语句来识别该 `url`；
- 因为访问用户详情页面的`url` 开头都是 `/?username=` ，所以我们在 `createServer` 中可以这么写：
```javascript
   http.createServer((request, response) => {
    if (request.url.toLowerCase().startsWith('/?username=')) {
    accessUserProfile(request, response);
    }
  }
```
- 在相应的`accessUserProfile(req, res)` 函数中我们需要获取具体的用户名，并判断该用户是否是已注册用户，如果是则展示详情页面，如果不是则重定向到注册页面；
    -  用户名可以通过 `var username = querystring.parse(url.parse(req.url).query).username;` 获得；
    - 获得用户名后，通过读取 `userData.json` 文件判断该用户是否已注册进行相应的重定向即可；
    - 若该用户为已注册用户，可通过拼接字符串的方法如 `'<p>学号：'+data[username].studentID + '</p>'` 拼接一个 `html` 并用 `res.end()` 将其返回给浏览器，也可以使用所谓“模板引擎”方法，这个暂时不讲；
- 到这里基本基本的螺丝钉都有了，只需要发挥点创造力动手将其组装成一架飞机就行了；
- End；
