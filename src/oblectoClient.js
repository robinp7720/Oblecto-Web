import OblectoClient from 'oblectoclient'

let host = OBLECTO_HOST ||
  window.location.protocol + '//' + window.location.hostname + ':' + (window.location.port || '80')

console.log(OBLECTO_HOST)

export default new OblectoClient(host)
