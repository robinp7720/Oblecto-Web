import OblectoClient from 'oblectoclient';

let host = `${window.location.protocol}//${window.location.hostname}`;

if (window.location.port) {
  host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
}

host = 'http://oblecto';

export default new OblectoClient(host);
