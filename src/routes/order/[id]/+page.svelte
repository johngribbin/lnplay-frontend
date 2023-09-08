<script lang="ts">
  import { page } from '$app/stores'
  import CopyValue from '$lib/elements/CopyValue.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import DownloadButton from '$lib/components/DownloadButton.svelte'
  import { onDestroy, onMount } from 'svelte'
  import { connect, request } from '../../utils'
  import Qr from '$lib/components/QR.svelte'

  type FetchInvoiceStatusResponse = {
    invoice_id: string
    node_count: number
    hours: number
    payment_type: string
    invoice_status: string
    deployment_details: DeploymentDetails
  }

  type DeploymentDetails = {
    node_count: 8
    hours: 8
    lnlive_plugin_version: string
    vm_expiration_date: string
    status: string
    connection_strings: string[]
  }

  // ID of the order
  const { id } = $page.params
  let invoiceStatusResponse: FetchInvoiceStatusResponse | null = null
  let pollInterval: string | number | NodeJS.Timer | undefined
  let connectionStrings: string[] = []

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

  $: {
    if (invoiceStatusResponse?.deployment_details?.connection_strings.length) {
      const {
        deployment_details: { connection_strings }
      } = invoiceStatusResponse
      connectionStrings = connection_strings
      stopInvoiceStatusPolling()
    }
  }

  function downloadCSV() {
    // Create a CSV content string
    const csvContent = connectionStrings.join('\n')
    // Create a Blob (binary large object) from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' })
    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob)
    // Create a link element for downloading
    const link = document.createElement('a')
    link.href = url
    link.download = 'data.csv' // Set the filename
    // Simulate a click to trigger the download
    link.click()
    // Clean up by revoking the Object URL
    window.URL.revokeObjectURL(url)
  }

  onMount(() => {
    connect()
    startInvoiceStatusPolling()
  })

  onDestroy(() => {
    stopInvoiceStatusPolling()
  })
</script>

<main class="p-6 pt-0 relative">
  <!-- ORDER DETAILS -->
  <section class="mt-20 text-center flex flex-wrap-reverse justify-center items-center gap-10">
    <div>
      <h1 class="font-bold text-6xl text-[#1736F5]">Your Order</h1>
      <p class="mt-5 font-bold text-2xl text-[#1736F5]">Bookmark this page!</p>
      <div class="mt-5 flex justfy-center flex-wrap">
        <p class="text-2xl mr-5 text-center">Save a copy of your order id:</p>
        <CopyValue value={id} />
      </div>
      <div class="mt-10">
        {#if connectionStrings.length}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="max-w-sm m-auto border" on:click={downloadCSV}>
            <DownloadButton copy={'.csv DOWNLOAD'} />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            {#each connectionStrings as connectionString, index}
              <div class="mt-5">
                <p class="mt-5 mb-5 font-bold">NODE {index + 1}:</p>
                <Qr data={connectionString} />
              </div>
            {/each}
          </div>
        {:else}
          <Loading />
          <p class="mt-5 text-2xl">Hang tight! Your nodes will be ready soon...</p>
        {/if}
      </div>
    </div>
  </section>
</main>
