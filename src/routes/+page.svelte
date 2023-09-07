<script lang="ts">
  import Lnmessage from 'lnmessage'
  import { parseNodeAddress } from './utils.js'
  import { onMount } from 'svelte'
  import FAQ from '$lib/components/FAQ.svelte'
  import { openModal } from 'svelte-modals'
  import Modal from '$lib/components/Modal.svelte'
  import LightningBoltSvg from '$lib/images/LightningBolt.svg'

  function handleClick() {
    openModal(Modal, { invoice: 'blabla' })
  }

  let ln: Lnmessage
  let connectionStatus$: Lnmessage['connectionStatus$']

  $: if (ln) {
    connectionStatus$ = ln.connectionStatus$
  }

  let address: string =
    '037b91a48eaf301ab330610a9b6d4b0bf5dfb1a1d309e097c561971d58d20ab8f6@lnplay.live:6002'
  let rune: string =
    'VEyOi35UjtAM70GuXWrc7hlQy39s7ccQedBep41cRi49MSZtZXRob2RebG5wbGF5bGl2ZSZyYXRlPTYw'
  let order = {
    node_count: 8,
    hours: 8
  }
  let createOrderResponse: CreateOrderResponse | null = null
  let invoice: string

  type CreateOrderResponse = {
    node_count: number
    hours: number
    expires_after: string
    bolt11_invoice_id: string
    bolt11_invoice: string
  }

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

      const response = (await ln.commando({
        method,
        params: parsedParams,
        rune
      })) as CreateOrderResponse
      return response
    } catch (error) {
      const { message } = error as { message: string }
      alert(message)
      return
    }
  }

  onMount(() => {
    connect()
  })

  async function createOrder() {
    const { node_count, hours } = order
    const response = await request(
      'lnplaylive-createorder',
      `{ "node_count": ${node_count}, "hours": ${hours} }`
    )

    if (response) {
      createOrderResponse = response
    }
  }

  // render the qr code to pay invoice.
  $: {
    if (createOrderResponse) {
      const { bolt11_invoice } = createOrderResponse
      invoice = bolt11_invoice
      openModal(Modal, { invoice })
    }
  }
</script>

<main class="p-6 pt-0 relative">
  {#if ln}
    <div class="absolute top-1 right-1 px-2 py-1 border-green-600 rounded border text-sm">
      Browser Id: {`${ln.publicKey.slice(0, 8)}...${ln.publicKey.slice(-8)}`}
    </div>
  {/if}

  <!-- HERO / VALUE PROP -->
  <section class="text-center flex flex-wrap-reverse justify-center items-center gap-10">
    <div class="max-w-sm">
      <svg
        width="100%"
        height="auto"
        viewBox="0 0 523 1079"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask
          id="mask0_242_77"
          style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100%"
          height="auto"
        >
          <path d="M0 0H523V1078.67H0V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_242_77)">
          <path
            d="M407.328 1.08984L296.302 297.147L523.037 262.507L0.036499 1078.93L194.417 540.001L32.4375 560.819L175.917 1.08984H407.328Z"
            fill="#FEDD2B"
          />
        </g>
        <mask
          id="mask1_242_77"
          style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100%"
          height="auto"
        >
          <path d="M0 0H236.536V1078.67H0V0Z" fill="white" />
        </mask>
        <g mask="url(#mask1_242_77)">
          <path
            d="M175.917 1.08984H217.578L32.4375 560.819L175.917 1.08984ZM0.036499 1078.93L236.083 540.001H194.417L0.036499 1078.93Z"
            fill="#557AFF"
          />
        </g>
      </svg>
    </div>
    <div>
      <h1 class="font-bold text-6xl text-[#1736F5]">LNPlay.live</h1>
      <p class="mt-5 font-bold text-2xl text-[#1736F5]">Rent a Lightning Network</p>
    </div>
  </section>
  <p class="mt-10 text-2xl text-[#1736F5] text-center max-w-2xl m-auto">
    {`Educate a room by safely demonstrating the power of lightning`}
  </p>
  <!-- PLACE ORDER -->
  <section class="mt-40 text-center border max-w-3xl p-5 pt-10 pl-10 m-auto rounded bg-[#FEDD2B]">
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
  <section class="mt-40 mb-20 max-w-3xl m-auto text-center">
    <h1 class="font-bold text-6xl mb-5">FAQ</h1>
    <FAQ />
  </section>
</main>
