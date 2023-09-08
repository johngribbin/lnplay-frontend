<script lang="ts">
  import { page } from '$app/stores'
  import CopyValue from '$lib/elements/CopyValue.svelte'
  import { onMount } from 'svelte'
  import { request } from '../../utils'

  type FetchInvoiceStatusResponse = {
    invoice_id: string
    node_count: number
    hours: number
    payment_type: string
    invoice_status: string
    deployment_details: string
  }

  const { id } = $page.params

  let invoiceStatusResponse: FetchInvoiceStatusResponse | null = null
  let pollInterval: string | number | NodeJS.Timer | undefined

  async function fetchInvoiceStatus() {
    if (id) {
      const response = (await request(
        'lnplaylive-invoicestatus',
        `{ "payment_type": "bolt11", "invoice_id": "${id}" }`
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

  onMount(() => {
    startInvoiceStatusPolling()
  })
</script>

<main class="p-6 pt-0 relative">
  <!-- ORDER DETAILS -->
  <section class="mt-20 text-center flex flex-wrap-reverse justify-center items-center gap-10">
    <div>
      <h1 class="font-bold text-6xl text-[#1736F5]">Your Order</h1>
      <p class="mt-5 font-bold text-2xl text-[#1736F5]">Bookmark this page!</p>
      <div class="mt-5 flex">
        <p class="text-[#1736F5] mr-5">Save a copy of your order id:</p>
        <CopyValue value={id} truncateLength={10} />
      </div>
    </div>
  </section>
</main>
