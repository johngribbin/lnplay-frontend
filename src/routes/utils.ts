import Lnmessage from 'lnmessage'

export type ParsedNodeAddress = {
  publicKey: string
  ip: string
  port?: number
}

export function parseNodeAddress(address: string): ParsedNodeAddress {
  const [publicKey, host] = address.split('@')
  const [ip, port] = host.split(':')

  return { publicKey, ip, port: port ? parseInt(port) : undefined }
}

export let ln: Lnmessage
export let connectionStatus$: Lnmessage['connectionStatus$']

const address =
  '037b91a48eaf301ab330610a9b6d4b0bf5dfb1a1d309e097c561971d58d20ab8f6@lnplay.live:6002'
export const rune =
  'VEyOi35UjtAM70GuXWrc7hlQy39s7ccQedBep41cRi49MSZtZXRob2RebG5wbGF5bGl2ZSZyYXRlPTYw'

export async function connect() {
  console.log('conect was called')
  const { publicKey, ip, port } = parseNodeAddress(address)

  // https://github.com/aaronbarnardsound/lnmessage#initialisation
  ln = new Lnmessage({
    // The public key of the node you would like to connect to
    remoteNodePublicKey: publicKey,
    // WebSocket proxy endpoint to connect through if running in prod
    wsProxy: 'wss://lnplay.live:6002',
    // The IP address of the node
    ip,
    // The port of the node, defaults to 9735
    port,
    // connect directly to a node without TLS
    wsProtocol: 'ws:',
    logger: {
      info: console.log,
      error: console.error,
      warn: console.warn
    }
  })

  // initiate the connection to the remote node
  await ln.connect()

  console.log('LN = ', ln)
}

export async function request(method: string, params: string) {
  let parsedParams: unknown | undefined

  try {
    parsedParams = params ? JSON.parse(params) : undefined

    const response = await ln.commando({
      method,
      params: parsedParams,
      rune
    })
    return response
  } catch (error) {
    const { message } = error as { message: string }
    alert(message)
    return
  }
}
