import { getApi, postApi } from '../utility/apiWrapper'

// CMC FUNCTIONS
export const getTicker = (ticker) => {
  return getApi('/api/v1/cmc/' + ticker)
    .then(res => {
      return JSON.parse(res.body)[0]
    })
    .catch(err => console.log(err));
}
