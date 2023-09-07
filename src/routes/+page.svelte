<script lang="ts">
  import { connect, request } from './utils.js'
  import { onDestroy, onMount } from 'svelte'
  import FAQ from '$lib/components/FAQ.svelte'
  import { closeModal, openModal } from 'svelte-modals'
  import Modal from '$lib/components/Modal.svelte'
  import { goto } from '$app/navigation'

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

    console.log(
      `
    
    response = 
    
    `,
      response
    )
    if (response) {
      createOrderResponse = response
      console.log(`
      
      createOrderResponse = ${createOrderResponse}
      
      `)
    }
  }

  async function fetchInvoiceStatus() {
    if (createOrderResponse?.bolt11_invoice_id) {
      const response = (await request(
        'lnplaylive-invoicestatus',
        `{ "payment_type": "bolt11", "invoice_id": "${createOrderResponse?.bolt11_invoice_id}" }`
      )) as FetchInvoiceStatusResponse

      if (response) {
        console.log('lnplaylive-invoicestatus response = ', response)
        invoiceStatusResponse = response
      }
    }
  }

  function startInvoiceStatusPolling() {
    pollInterval = setInterval(fetchInvoiceStatus, 5000) // 5 seconds
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

<main class="p-6 pt-0 relative">
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
  <p class="mt-10 text-4xl text-bold text-[#1736F5] text-center max-w-2xl m-auto">
    {`explore the power of the lightning network with your own testing environment`}
  </p>
  <!-- PLACE ORDER -->
  <section class="mt-20 text-center border max-w-3xl p-5 pt-10 pl-10 m-auto rounded bg-[#FEDD2B]">
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
  <section class="mt-20 mb-20 max-w-3xl m-auto">
    <h1 class="font-bold text-6xl mb-5">FAQ</h1>
    <FAQ />
  </section>
</main>
