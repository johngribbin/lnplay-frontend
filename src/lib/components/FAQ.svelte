<script lang="ts">
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton'

  const faqs = [
    {
      q: 'Who is this for?',
      a: 'A streamlined and interactive introduction to lightning nodes for Bitcoin education; ideal for meetups, classrooms, conferences, boardrooms, family gatherings, and even dev experimentation.'
    },
    {
      q: 'What do participants learn?',
      a: 'Open lightning channels, make payments, manage liquidity, update channel fees, route payments, re-balancing, BOLT12 offers, and more. This is a full lightning experience.'
    },
    {
      q: 'How does it work?',
      a: 'When you complete a purchase you receive connection details to all nodes you rent. These details are encoded in a QR code for users to scan and be instantly onboarded to Clams app, in control of their own node. Each node will start with a balance of 1 bitcoin.'
    },
    {
      q: 'How long are block times?',
      a: 'This is a Regtest with 5 second confirmation times, enabling seamless learning.'
    },
    {
      q: 'How is pricing determined?',
      a: 'The price is 200 sats per node-hour. For example, a 16 node environment for 8 hours would be 16*8*200 = 25,600 sats.'
    },
    {
      q: 'What if I need more time or nodes?',
      a: 'Once purchased, any changes require purchasing a new environment. For larger events requiring more nodes or longer rental periods, please email us at info@lnplay.live'
    },
    {
      q: 'What else could LNPlay do?',
      a: 'We believe LNPLay is a proof of concept for spinning up ephemeral cloud services. The code is fully open source. We welcome contributors and experimentation with the stack.'
    }
  ]
</script>

<Accordion class="text-left">
  {#each faqs as { q, a }}
    <AccordionItem class="border rounded mb-2">
      <div class="font-bold mt-3 mb-3 ml-3" slot="summary">{q}</div>
      <div slot="content" class="pb-3 ml-3">{a}</div>
    </AccordionItem>
  {/each}
</Accordion>
