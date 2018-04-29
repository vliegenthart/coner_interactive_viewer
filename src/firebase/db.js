import { db } from './firebase';

// User API
export const doCreateUser = (id, username, email, ostUuid, role="USER") =>
  db.ref(`users/${id}`).set({
    username,
    email,
    ostUuid,
    role,
  });

export const onceGetUsers = () =>
  db.ref('users').once('value');

export const onceGetUser = (id) =>
  db.ref(`users/${id}`).once('value');

// Highlight API
export const doCreateHighlight = (id, highlight) => {
  return db.ref(`highlights/${id}`).set({
    ...highlight
  });
}

export const onceGetHighlights = () =>
  db.ref('highlights').once('value');

export const onceGetHighlight = (id) =>
  db.ref(`highlights/${id}`).once('value');

// Feedback API
