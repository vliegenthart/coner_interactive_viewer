import * as firebase from 'firebase';

var prodConfig = {
  apiKey: "AIzaSyA7JyJvn2uHke740_P0FCp4RtfKb8ksl4c",
  authDomain: "coner-viewer-production.firebaseapp.com",
  databaseURL: "https://coner-viewer-production.firebaseio.com",
  projectId: "coner-viewer-production",
  storageBucket: "coner-viewer-production.appspot.com",
  messagingSenderId: "580490318012"
};

var devConfig = {
  apiKey: "AIzaSyDr6S81E4OGd6X3wjHVvyPzjcxrf5thtrQ",
  authDomain: "coner-viewer-develop.firebaseapp.com",
  databaseURL: "https://coner-viewer-develop.firebaseio.com",
  projectId: "coner-viewer-develop",
  storageBucket: "",
  messagingSenderId: "618887202496"
};

const config = process.env.NODE_ENV === 'production'
  ? prodConfig
  : devConfig;

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const db = firebase.database();
const auth = firebase.auth();

export {
  db,
  auth,
};