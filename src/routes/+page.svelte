<script lang="ts">
  import Lnmessage from 'lnmessage'
  import { parseNodeAddress } from './utils.js'
  import { onMount } from 'svelte'

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

  let products = [
    {
      node_count: 8,
      hours: 8,
      showDropdown: false
    },
    {
      node_count: 16,
      hours: 8,
      showDropdown: false
    },
    {
      node_count: 32,
      hours: 8,
      showDropdown: false
    }
  ]

  let rentalHours = [4, 8, 16, 24]
</script>

<main class="w-screen flex-col items-center justify-center p-6 relative">
  <!-- {#if ln}
    <div class="absolute top-1 right-1 px-2 py-1 border-green-600 rounded border text-sm">
      Browser Id: {`${ln.publicKey.slice(0, 8)}...${ln.publicKey.slice(-8)}`}
    </div>
  {/if} -->

  <!-- <div class="w-1/2 max-w-lg"> -->
  <!-- <h1 class="font-bold text-3xl mb-4 w-full text-center">Create CoreLN App</h1> -->
  <!-- <div class="w-full mt-4 text-sm p-4 border-2 rounded border-purple-300"> -->
  <!-- <label class="text-neutral-600 font-medium mb-1 block" for="address">Address</label>
      <textarea
        id="address"
        class="border w-full p-2 rounded"
        rows="3"
        bind:value={address}
        placeholder="033f4bbfcd67bd0fc858499929a3255d063999ee23f4c5e12b8b1089e132b3e408@localhost:7272"
      /> -->

  <!-- <div class="flex items-center justify-between w-full">
        <button
          on:click={connect}
          disabled={!address}
          class="mt-2 border border-purple-500 rounded py-1 px-4 disabled:opacity-20 hover:shadow-md active:shadow-none"
          >Connect</button
        >

        {#if connectionStatus$}
          <div class="flex items-center">
            <div class="text-sm">{$connectionStatus$}</div>
            <div
              class:bg-green-500={$connectionStatus$ === 'connected'}
              class:bg-yellow-500={$connectionStatus$ === 'connecting' ||
                $connectionStatus$ === 'waiting_reconnect'}
              class:bg-red-500={$connectionStatus$ === 'disconnected'}
              class="w-3 h-3 rounded-full ml-1 transition-colors"
            />
          </div>
        {/if}
      </div>
    </div> -->

  <!-- <div class="w-full mt-8 text-sm p-4 border-2 rounded border-yellow-300">
        <label class="text-neutral-600 font-medium mb-1 block" for="rune">Rune</label>
        <textarea
          id="rune"
          class="border w-full p-2 rounded"
          rows="2"
          bind:value={rune}
          placeholder="O2osJxV-6lGUgAf-0NllduniYbq1Zkn-45trtbx4qAE9MA=="
        />
      </div> -->
  <div />

  <!-- PRODUCTS -->
  <div class="bg-white">
    <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h2 class="sr-only">Products</h2>
      <div class="flex gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {#each products as { node_count, hours, showDropdown }, index}
          <div class="group">
            <div
              class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7"
            >
              <img
                src="https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-01.jpg"
                alt="Tall slender porcelain bottle with natural clay textured body and cork stopper."
                class="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <!-- User Option -->
            <div class="mt-4 flex justify-between items-center">
              <h3 class="text-2xl text-gray-700">{node_count} nodes for {hours} hours</h3>
              <div class="relative inline-block text-left">
                <!-- OPEN DROPDOWN -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  on:click={() => {
                    products = products.map((product, i) => {
                      if (i === index) {
                        return {
                          ...product,
                          showDropdown: !product.showDropdown
                        }
                      } else {
                        return product
                      }
                    })
                  }}
                >
                  <button
                    type="button"
                    class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                  >
                    Update Hours
                    <svg
                      class="-mr-1 h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <!-- DROPDOWN -->
                {#if showDropdown}
                  <div
                    class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabindex="-1"
                  >
                    <div class="py-1" role="none">
                      <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" -->
                      {#each rentalHours as hour}
                        <div
                          class="text-gray-700 block px-4 py-2 text-sm"
                          role="menuitem"
                          tabindex="-1"
                          id="menu-item-0"
                        >
                          {hour}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
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
