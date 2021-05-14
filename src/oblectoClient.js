import OblectoClient from 'oblectoclient';

const OBLECTO_HOST = 'http://oblecto';

export let host = window.location.protocol + '//' + window.location.hostname;

if (window.location.port) {
    host = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
}

if (OBLECTO_HOST) host = OBLECTO_HOST;

export default new OblectoClient(host);
