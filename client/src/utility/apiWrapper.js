import ostSettings from '../ost/ostClientSettings';

export const getApi = async (url) => {
  if (!ostSettings.ostDevMode) return { 'body': {}}

  const response = await fetch(url);
  const body = await response.json();

  if (response.status !== 200) throw Error(body.message);

  return body;
}

export const postApi = async (url, data) => {
  if (!ostSettings.ostDevMode) return {}

  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const response = await fetch(url, {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(data)
  });

  const body = await response.json();

  if (response.status !== 200) throw Error(body.message);

  return body;
}
