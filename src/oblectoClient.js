import OblectoClient from 'oblectoclient';

let host = `${window.location.protocol}//${window.location.hostname}`;

if (window.location.port) {
  host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
}

export default new OblectoClient(host);
