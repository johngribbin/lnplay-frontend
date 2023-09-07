<script lang="ts">
  import { fade } from 'svelte/transition'
  import { onDestroy } from 'svelte'
  import { writeClipboardValue } from '../utils'
  import { browser } from '$app/environment'
  import type QRCodeStyling from 'qr-code-styling'
  import CopyValue from '$lib/elements/CopyValue.svelte'
  export let data: string = ''

  export let size = Math.min(window.innerWidth - 50, 400)

  export function getQrImage() {
    return canvas?.toDataURL()
  }

  let canvas: HTMLCanvasElement | null = null
  let node: HTMLDivElement
  let qrCode: QRCodeStyling
  let rendered = false

  $: if (browser && data && node && !rendered) {
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      qrCode = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data: `lightning:${data}`.toUpperCase(),
        imageOptions: { hideBackgroundDots: false, imageSize: 0.25, margin: 0 },
        dotsOptions: {
          type: 'dots',
          color: '#ec4899',
          gradient: {
            type: 'radial',
            rotation: 0.017453292519943295,
            colorStops: [
              { offset: 0, color: '#f97316' },
              { offset: 1, color: '#d946ef' }
            ]
          }
        },
        backgroundOptions: { color: '#ffffff' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#22c55e' },
        cornersDotOptions: { type: 'dot', color: '#000000' }
      })

      qrCode.append(node)
      rendered = true
    })
  }

  let copySuccess = false
  let copyTimeout: NodeJS.Timeout

  async function copyInvoice() {
    if (invoice) {
      copySuccess = await writeClipboardValue(invoice)

      if (copySuccess) {
        copyTimeout = setTimeout(() => (copySuccess = false), 3000)
      }
    }
  }

  onDestroy(() => {
    copyTimeout && clearTimeout(copyTimeout)
  })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  on:click={copyInvoice}
  in:fade|local={{ duration: 250 }}
  class="cursor-pointer border-2 border-neutral-400 rounded-lg shadow-md max-w-full p-2 md:p-4 flex flex-col justify-center items-center relative"
>
  <div class="rounded overflow-hidden transition-opacity" bind:this={node} />
  <div>
    <CopyValue truncateLength={10} value={data} />
  </div>
</div>
