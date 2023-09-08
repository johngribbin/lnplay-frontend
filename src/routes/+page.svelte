<script lang="ts">
  import { connect, request } from './utils.js'
  import { onDestroy, onMount } from 'svelte'
  import FAQ from '$lib/components/FAQ.svelte'
  import { closeModal, openModal } from 'svelte-modals'
  import Modal from '$lib/components/Modal.svelte'
  import { goto } from '$app/navigation'
  import LightningBoltSVG from '$lib/images/LightningBolt.svelte'
  import LightningBolt from '$lib/images/LightningBolt.svelte'

  type CreateOrderResponse = {
    node_count: number
    hours: number
    expires_after: string
    bolt11_invoice_id: string
    bolt11_invoice: string
  }

  type FetchInvoiceStatusResponse = {
    invoice_id: string
    node_count: number
    hours: number
    payment_type: string
    invoice_status: string
    deployment_details: string
  }

  let order = {
    node_count: 8,
    hours: 8
  }
  let createOrderResponse: CreateOrderResponse | null = null
  let invoiceStatusResponse: FetchInvoiceStatusResponse | null = null
  let pollInterval: string | number | NodeJS.Timer | undefined

  onMount(() => {
    connect()
  })

  async function createOrder() {
    const { node_count, hours } = order
    const response = (await request(
      'lnplaylive-createorder',
      `{ "node_count": ${node_count}, "hours": ${hours} }`
    )) as CreateOrderResponse

    if (response) {
      createOrderResponse = response
    }
  }

  async function fetchInvoiceStatus() {
    if (createOrderResponse?.bolt11_invoice_id) {
      const response = (await request(
        'lnplaylive-invoicestatus',
        `{ "payment_type": "bolt11", "invoice_id": "${createOrderResponse?.bolt11_invoice_id}" }`
      )) as FetchInvoiceStatusResponse

      if (response) {
        invoiceStatusResponse = response
      }
    }
  }

  function startInvoiceStatusPolling() {
    pollInterval = setInterval(fetchInvoiceStatus, 1000) // 1 second
  }

  function stopInvoiceStatusPolling() {
    clearInterval(pollInterval)
  }

  // render the invoice as sqr code in modal & start polling for invoice status
  $: {
    if (createOrderResponse) {
      openModal(Modal, { invoice: createOrderResponse.bolt11_invoice })
      startInvoiceStatusPolling()
    }
  }

  // when invoice gets paid, forward user to order page
  $: {
    if (invoiceStatusResponse?.invoice_status === 'paid') {
      stopInvoiceStatusPolling()
      closeModal()
      goto(`/order/${invoiceStatusResponse.invoice_id}`)
    }
  }

  // Stop polling when the component is destroyed
  onDestroy(() => {
    stopInvoiceStatusPolling()
  })
</script>

<main class="relative">
  <!-- HERO / VALUE PROP -->
  <section class="text-center flex flex-wrap-reverse justify-center items-center gap-10 pl-5 pr-5">
    <div class="max-w-sm">
      <svelte:component this={LightningBoltSVG} />
    </div>
    <div>
      <h1 class="font-bold text-4xl md:text-6xl text-[#1736F5] mt-5">LNPlay.live</h1>
      <p class="mt-5 font-bold text-2xl text-[#1736F5]">Rent a Lightning Network</p>
    </div>
  </section>
  <p class="mt-10 text-2xl text-[#1736F5] text-center w-full max-w-md m-auto pl-5 pr-5">
    Educate a room by safely demonstrating the power of lightning
  </p>
  <!-- PLACE ORDER -->
  <section class="w-full mt-20 text-center p-5 pt-10 pb-10 m-auto rounded bg-[#FEDD2B]/40">
    <h1 class="font-bold text-4xl md:text-6xl">Place Your Order</h1>
    <div class="mt-8 flex-wrap md:flex gap-5 justify-center items-center">
      <div>
        <p class="font-bold text-2xl text-4xl mr-4">{order.node_count} NODES</p>
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
      <div class="mt-5 md:mt-0">
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
  <section class="mt-20 mb-20 max-w-3xl m-auto pl-5 pr-5">
    <h1 class="font-bold text-6xl mb-5">FAQ</h1>
    <FAQ />
  </section>
</main>
