import { getApi, postApi } from '../utility/apiWrapper'


class CmcClient {
  constructor() {
    this.getTicker = this.getTicker.bind(this);
  }

  getTicker = (ticker) => {
    return getApi('/api/v1/cmc/' + ticker)
      .then(res => {
        return JSON.parse(res.body)[0]
      })
      .catch(err => console.log(err));
  }
}

export default CmcClient;
