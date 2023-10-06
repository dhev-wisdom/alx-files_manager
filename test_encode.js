const sha1 = require('sha1');

// const str_ = 'bob@dylan.com:toto1234!';
const str_ = 'Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
// const encodedStr = Buffer.from(str_).toString('base64');
// const encodedStr = Buffer.from(str_, 'base64').toString('utf-8');
// console.log(encodedStr);
console.log(sha1('toto1234!'));
//Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=