'use strict';
/*
将 html 中的 {{ xxx }} 替换成 data[xxx]；
*/

var renderTemplate = (html, data) => {
  // 正则表达式，用以匹配 {{ xxx }} 文段
  var pattern = /{{([\s\S]+?)}}/gi;
  var result = html.replace(pattern, (match, tuple) => {
    // .trim() 会去除字符串前后的空白字符；
    // 如果该键不存在，则替换为空字符；
    return data[tuple.trim()] || '';
  });
  return result;
}

module.exports = renderTemplate;