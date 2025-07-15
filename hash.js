import bcrypt from 'bcrypt';

const password = 'TuPasswordSeguro123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log('Hash generado:', hash);
});
