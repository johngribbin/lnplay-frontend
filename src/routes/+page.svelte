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
    pollInterval = setInterval(fetchInvoiceStatus, 3000) // 1 second
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
<style>
  .construction-banner {
    width: 100%;
    height: 50px;
    border-top-left-radius: 0; /* Set top-left border radius to 0 */
    border-top-right-radius: 0; /* Set top-right border radius to 0 */
    border-bottom-left-radius: 8px; /* Maintain bottom-left border radius as 8px */
    border-bottom-right-radius: 8px; /* Maintain bottom-right border radius as 8px */
    background: #1736F5; /* Updated background color */
    box-shadow: 0px 4px 6px 1px rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .construction-banner-text {
    font-family: "Courier New", monospace;
    font-weight: bold;
    font-size: 24px;
    color: #FEDD2B;
  }

  .github-icon {
    position: relative;
    display: inline-block;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }

  .github-icon {
    width: 24px; /* Adjust the size as needed */
    height: 24px; /* Adjust the size as needed */
  }
</style>
<!--Added banner-->
<div class="construction-banner">
  <span class="construction-banner-text">Under Construction</span>
</div>
<main class="relative">
  <!-- HERO / VALUE PROP -->
  <section class="text-center flex flex-wrap-reverse justify-center items-center gap-10 pl-5 pr-5">
   <!--swapped bolt svg and text from right to left. Also added word "private"-->
    <div>
      <h1 class="font-bold text-4xl md:text-6xl text-[#1736F5] mt-5">LNPlay.live</h1>
      <p class="mt-5 font-bold text-2xl text-[#1736F5]">Rent a Private Lightning Network</p>
    </div>
    <div class="max-w-sm">
      <svelte:component this={LightningBoltSVG} />
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
              node_count: e?.target.value
            }
          }}
        />
      </div>
      <div class="mt-5 md:mt-0">
        <!--Had to fix font style for HOURS below like this. Some type of bug caused fix like this-->
        <p style="font-family: 'Courier New', Courier, monospace; font-weight: 700; font-size: 41px; line-height: 45px; color: #000000;">{order.hours} HOURS</p>
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
              hours: e?.target.value
            }
          }}
        />
      </div>
    </div>
<!--changed buy button to blue-->
    <div class="mt-8">
      <button disabled
        type="button"
        class="text-4xl inline-block rounded bg-[#1736F5] px-6 pb-2 pt-2.5 font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
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
<!--added github icon-->
<div>
  <a class="github-icon" href="https://github.com/farscapian/lnplay">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
</a>
</div>