import { getApi, postApi } from '../utility/apiWrapper'
import ostSettings from '../ost/ostClientSettings';


class CmcClient {
  constructor() {
    this.getTicker = this.getTicker.bind(this);
  }

  getTicker = (ticker) => {
    return getApi('/api/v1/cmc/' + ticker)
      .then(res => {
        if (ostSettings.ostDevMode) return JSON.parse(res.body)[0]
      })
      .catch(err => console.log(err));
  }
}

export default CmcClient;
