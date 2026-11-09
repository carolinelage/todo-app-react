const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp({
  credential: applicationDefault(),
});

const uid = process.argv[2];

if (!uid) {
  throw new Error('Informe o UID do usuário.');
}

getAuth().setCustomUserClaims(uid, { admin: true })
  .then(() => console.log('Administrador configurado com sucesso.'))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });