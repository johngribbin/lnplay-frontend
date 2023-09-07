<script lang="ts">
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton'

  const faqs = [
    {
      q: 'This is Question 1 bla bla',
      a: 'Answer 1'
    },
    {
      q: 'This is Question 2 bla bla',
      a: 'Answer 2'
    },
    {
      q: 'This is Question 3 bla bla',
      a: 'Answer 3'
    },
    {
      q: 'This is Question 4 bla bla',
      a: 'Answer 4'
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
