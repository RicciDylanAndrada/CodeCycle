"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import ProblemCard from "./ProblemCard";

interface Problem {
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
  status?: "due" | "reviewed" | "ok";
}

interface TopicAccordionProps {
  topic: string;
  problems: Problem[];
}

const TopicAccordion = ({ topic, problems }: TopicAccordionProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={topic}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <span className="font-medium">{topic}</span>
            <Badge variant="secondary">{problems.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pt-2">
            {problems.map((problem) => (
              <ProblemCard
                key={problem.slug}
                slug={problem.slug}
                title={problem.title}
                difficulty={problem.difficulty}
                tags={problem.tags}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TopicAccordion;
