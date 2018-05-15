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

export const onceGetHighlight = (pid, id) =>
  db.ref(`highlights/${pid}/${id}`).once('value');

// Rating API
export const doCreateRating = (id, rating) => {
  return db.ref(`ratings/${rating.pid}/${id}`).set({
    ...rating
  });
}

export const onceGetRatings = (pid) =>
  db.ref(`ratings/${pid}`).once('value');

export const onceGetRating = (pid, id) =>
  db.ref(`ratings/${pid}/${id}`).once('value');

// OSTReward API
export const doCreateReward = (id, reward) => {
  return db.ref(`rewards/${reward.pid}/${id}`).set({
    ...reward
  });
}

export const onceGetRewards = (pid) =>
  db.ref(`rewards/${pid}`).once('value');

export const onceGetReward = (pid, id) =>
  db.ref(`rewards/${pid}/${id}`).once('value');