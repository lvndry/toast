import { useMemo } from "react";

import { Testimonial } from "@/components/testimonials/testimonial";
import { Testimonials } from "@/components/testimonials/testimonials";

import testimonials from "../data/testimonials";

export function TestimonialsSection() {
  const columns = useMemo(() => {
    return testimonials.items.reduce<Array<typeof testimonials.items>>(
      (columns, t, i) => {
        columns[i % 3].push(t);

        return columns;
      },
      [[], [], []],
    );
  }, []);

  return (
    <Testimonials className="container max-w-7xl mx-auto px-4 py-20">
      {columns.map((column, i) => (
        <div key={i} className="flex flex-col gap-8">
          {column.map((t, i) => (
            <Testimonial key={i} {...t} />
          ))}
        </div>
      ))}
    </Testimonials>
  );
}
