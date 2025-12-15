import { Section, SectionProps, SectionTitle } from "@/components/section";

interface FaqProps extends Omit<SectionProps, "title" | "children"> {
  title?: string;
  description?: string;
  items: { q: React.ReactNode; a: React.ReactNode }[];
}

export function Faq(props: FaqProps) {
  const {
    title = "Frequently asked questions",
    description,
    items = [],
    ...rest
  } = props;
  return (
    <Section id="faq" {...rest} className="py-10 space-y-10">
      <SectionTitle title={title} description={description} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
        {items?.map(({ q, a }, i) => {
          return <FaqItem key={i} question={q} answer={a} />;
        })}
      </div>
    </Section>
  );
}

export interface FaqItemProps {
  question: React.ReactNode;
  answer: React.ReactNode;
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <dl>
      <dt className="font-semibold mb-2">{question}</dt>
      <dd className="text-muted-foreground">{answer}</dd>
    </dl>
  );
}
