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

export const onceGetUser = (id) =>
  db.ref(`users/${id}`).once('value');

// Highlight API
export const doCreateHighlight = (id, highlight, timestamp, pid, uid, type='selected') => {
  highlight.metadata = { ...highlight.metadata, timestamp: timestamp, type: type }

  return db.ref(`highlights/${id}`).set({
    ...highlight,
    pid,
    uid,
  });
}

export const onceGetHighlights = () =>
  db.ref('highlights').once('value');

export const onceGetHighlight = (id) =>
  db.ref(`highlights/${id}`).once('value');

// Feedback API
