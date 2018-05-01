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
  return db.ref(`highlights/${highlight.pid}/${id}`).set({
    ...highlight
  });
}

export const onceGetHighlights = (pid) =>
  db.ref(`highlights/${pid}`).once('value');

export const onceGetHighlightsForUser = (pid, uid) =>
  db.ref(`highlights/${pid}`).once('value');

export const onceGetHighlight = (pid, id) =>
  db.ref(`highlights/${pid}/${id}`).once('value');

// Feedback API
