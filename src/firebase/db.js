import { db } from './firebase';

// User API

export const doCreateUser = (id, username, email, ostUuid) =>
  db.ref(`users/${id}`).set({
    username,
    email,
    ostUuid,
  });

export const onceGetUsers = () =>
  db.ref('users').once('value');

// Other Entity APIs ...