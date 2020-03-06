const bcrypt = require('bcryptjs');

const passwords = ['password',
'bo-password',
'charlie-password',
'sam-password',
'lex-password',
'ping-password'];

for(let i = 0; i < passwords.length; i++) {
  bcrypt.hash(passwords[i], 12).then(hash => console.log({ hash }))
}
