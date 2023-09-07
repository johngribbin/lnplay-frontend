<script lang="ts">
  import Lnmessage from 'lnmessage'
  import { parseNodeAddress } from './utils.js'
  import { onMount } from 'svelte'
  import FAQ from '../components/FAQ.svelte'

  let ln: Lnmessage
  let connectionStatus$: Lnmessage['connectionStatus$']

  $: if (ln) {
    connectionStatus$ = ln.connectionStatus$
  }

  let address: string =
    '03b3bfe683fe1fd7ec42f349d6f9697fd9ba1d9f24a29615a324d1e0a89475d405@lnplay.live:6002'
  let rune: string = '2IqUuIKMC9sIvXvo_3hiRTofZX_owEpynjRrq9wP1pk9MQ=='
  let response

  async function connect() {
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
  }

  async function request(method: string, params: string) {
    let parsedParams: unknown | undefined

    try {
      parsedParams = params ? JSON.parse(params) : undefined

      const requestResult = await ln.commando({
        method,
        params: parsedParams,
        rune
      })

      const result = JSON.stringify(requestResult, null, 2)

      return result
    } catch (error) {
      const { message } = error as { message: string }
      alert(message)
      return
    }
  }

  onMount(() => {
    connect()
  })

  let order = {
    node_count: 8,
    hours: 8
  }

  async function createOrder() {
    const { node_count, hours } = order
    response = await request(
      'lnplaylive-createorder',
      `{ "node_count": ${node_count}, "hours": ${hours} }`
    )
    console.log('RESPONSE = ', response)
  }
</script>

<main class="p-6 relative">
  <!-- {#if ln}
    <div class="absolute top-1 right-1 px-2 py-1 border-green-600 rounded border text-sm">
      Browser Id: {`${ln.publicKey.slice(0, 8)}...${ln.publicKey.slice(-8)}`}
    </div>
  {/if} -->

  <!-- HERO / VALUE PROP -->
  <section class="text-center border">
    <h1 class="font-bold text-6xl">LNPlay</h1>
    <p class="mt-5 text-2xl">
      @TODO - Hero. - Add value prop here? - What is lnplay? - Why its important? - Some example use
      cases - Add hero background image?
    </p>
  </section>
  <!-- PLACE ORDER -->
  <section class="mt-40 text-center border">
    <h1 class="font-bold text-6xl">Place Your Order</h1>
    <div class="mt-8 flex gap-4 justify-center items-center">
      <div class="">
        <p class="font-bold text-4xl mr-4">{order.node_count} NODES</p>
        <input
          class="h-2 bg-blue-200 appearance-none mr-4"
          type="range"
          min={8}
          max="32"
          step="8"
          bind:value={order.node_count}
          on:change={(e) => {
            order = {
              ...order,
              node_count: e.target.value
            }
          }}
        />
      </div>
      <div class="">
        <p CLASS="font-bold text-4xl mr-4">{order.hours} HOURS</p>
        <input
          class="h-2 bg-blue-200 appearance-none mr-4"
          type="range"
          min={8}
          max="24"
          step="8"
          bind:value={order.hours}
          on:change={(e) => {
            order = {
              ...order,
              hours: e.target.value
            }
          }}
        />
      </div>
    </div>

    <div class="mt-8">
      <button
        type="button"
        class="text-4xl inline-block rounded bg-black px-6 pb-2 pt-2.5 font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
        on:click={createOrder}
      >
        BUY
      </button>
    </div>
  </section>
  <!-- FAQ -->
  <section class="mt-40 text-center mb-20">
    <h1 class="font-bold text-6xl mb-5">FAQ</h1>
    <FAQ />
  </section>
</main>
