import OblectoClient from 'oblectoclient'

let host = window.location.protocol + '//' + window.location.hostname

if (window.location.port) {
  host = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port
}

if (OBLECTO_HOST) host = OBLECTO_HOST

console.log(OBLECTO_HOST)

export default new OblectoClient(host)
