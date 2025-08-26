import { Section, SectionProps, SectionTitle } from "components/section"

import { SimpleGrid, chakra } from "@chakra-ui/react"

interface FaqProps extends Omit<SectionProps, "title" | "children"> {
  title?: React.ReactNode
  description?: React.ReactNode
  items: { q: React.ReactNode; a: React.ReactNode }[]
}

export function Faq(props: FaqProps) {
  const {
    title = "Frequently asked questions",
    description,
    items = [],
  } = props
  return (
    <Section id="faq" {...props} spacingY={10} py={10}>
      <SectionTitle title={title} description={description} />

      <SimpleGrid columns={[1, null, 2]} spacingY={10} spacingX="20">
        {items?.map(({ q, a }, i) => {
          return <FaqItem key={i} question={q} answer={a} />
        })}
      </SimpleGrid>
    </Section>
  )
}

export interface FaqItemProps {
  question: React.ReactNode
  answer: React.ReactNode
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <chakra.dl>
      <chakra.dt fontWeight="semibold" mb="2">
        {question}
      </chakra.dt>
      <chakra.dd color="muted">{answer}</chakra.dd>
    </chakra.dl>
  )
}
