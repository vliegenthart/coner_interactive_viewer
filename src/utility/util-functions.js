import config from '../components/config'

export const snapshotToArray = snapshot => Object.entries(snapshot).map(e => Object.assign(e[1], { id: e[0] }));

export const getNextId = () => String(1000000000 + Math.floor(Math.random() * 9000000000));

export const setHighlightsRated = (ratingsLen, rating) => {
  if (ratingsLen === config.facets.length) {
    [...document.getElementsByClassName('entityText-' + rating.entityText)].map(el =>
      el.classList.add('Rated__highlight')
    )
  }
} 

export const truncate = (str, max) => {
  if (str.length > max) return str.substring(0,max)+'...'
  return str
}

export const uniqueHighlights = (highlights) => {
  return highlights.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj.content && obj.content && mapObj.content.text).indexOf(obj.content.text) === pos;
  });
}

export const updateHash = highlight => {
  window.location.hash = `highlight-${highlight.id}`;
};