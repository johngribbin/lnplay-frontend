<script lang="ts">
  import Lnmessage from 'lnmessage'
  import { parseNodeAddress } from './utils.js'
  import { onMount } from 'svelte'
  import Slider from '../components/Slider.svelte'

  let ln: Lnmessage
  let connectionStatus$: Lnmessage['connectionStatus$']

  $: if (ln) {
    connectionStatus$ = ln.connectionStatus$
  }

  let address: string =
    '03b3bfe683fe1fd7ec42f349d6f9697fd9ba1d9f24a29615a324d1e0a89475d405@lnplay.live:6002'
  let rune: string = '2IqUuIKMC9sIvXvo_3hiRTofZX_owEpynjRrq9wP1pk9MQ=='
  let method: string
  let params: string
  let result: string

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

  async function request() {
    let parsedParams: unknown | undefined

    try {
      parsedParams = params ? JSON.parse(params) : undefined

      const requestResult = await ln.commando({
        method,
        params: parsedParams,
        rune
      })

      result = JSON.stringify(requestResult, null, 2)
    } catch (error) {
      const { message } = error as { message: string }
      alert(message)
      return
    }
  }

  onMount(() => {
    connect()
  })

  let product = {
    node_count: 8,
    hours: 8,
    showDropdown: false
  }
</script>

<main class="w-screen flex-col items-center justify-center p-6 relative">
  {#if ln}
    <div class="absolute top-1 right-1 px-2 py-1 border-green-600 rounded border text-sm">
      Browser Id: {`${ln.publicKey.slice(0, 8)}...${ln.publicKey.slice(-8)}`}
    </div>
  {/if}

  <!-- PRODUCT -->
  <div class="flex-col justify-center w-screen items-center border items-center">
    <p>{product.node_count} NODES</p>
    <input
      class="h-2 bg-purple-50 appearance-none mr-4 accent-purple-500 dark:accent-purple-300"
      type="range"
      min={8}
      max="32"
      step="8"
      bind:value={product.node_count}
      on:change={(e) => {
        product = {
          ...product,
          node_count: e.target.value
        }
      }}
    />
    <p>{product.hours} HOURS</p>
    <input
      class="h-2 bg-purple-50 appearance-none mr-4 accent-purple-500 dark:accent-purple-300"
      type="range"
      min={8}
      max="24"
      step="8"
      bind:value={product.hours}
      on:change={(e) => {
        product = {
          ...product,
          hours: e.target.value
        }
      }}
    />
  </div>

  <!-- TESTING -->
  <!-- <div class="border w-full flex items-center">
    <div class="w-1/2 p-4 border-2 rounded border-orange-300 mt-8">
      <div class="w-full text-sm">
        <label class="text-neutral-600 font-medium mb-1 block" for="method">Method</label>
        <input
          id="method"
          class="border w-full p-2 rounded"
          type="text"
          bind:value={method}
          placeholder="getinfo"
        />
      </div>

      <div class="w-full mt-4 text-sm">
        <label class="text-neutral-600 font-medium mb-1 block" for="params">Params</label>
        <textarea
          id="params"
          class="border w-full p-2 rounded"
          rows="4"
          bind:value={params}
          placeholder={JSON.stringify({ key: 'value' }, null, 2)}
        />
      </div>

      <button
        on:click={request}
        disabled={!connectionStatus$ || !rune || !method}
        class="mt-2 border border-purple-500 rounded py-1 px-4 disabled:opacity-20 hover:shadow-md active:shadow-none"
        >Request</button
      >
    </div>
    <div class="w-1/2 p-4 border-2 rounded border-green-300 ml-4">
      <div class="w-full text-sm">
        <label class="text-neutral-600 font-medium mb-1 block" for="params">Result</label>
        <textarea
          id="params"
          class="border w-full p-2 rounded"
          rows="20"
          value={result || ''}
          placeholder={JSON.stringify({ key: 'value' }, null, 2)}
        />
      </div>
    </div>
  </div> -->
</main>
