//src\content.config.ts
import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

const quizAnswerSchema = z.object({
  id: z.string(),
  text: z.string(),
  correct: z.boolean(),
});

const quizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  description: z.string().optional(),
  type: z.enum(["single", "multiple"]).default("single"),
  tip: z.string().optional(),
  explanation: z.string(),
  resources: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    )
    .optional(),
  answers: z.array(quizAnswerSchema).min(2),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
  }),
  quiz: defineCollection({
    type: "data",
    schema: z.object({
      title: z.string(),
      description: z.string(),
      level: z.string().optional(),
      estimatedTime: z.string().optional(),
      questions: z.array(quizQuestionSchema).min(1),
    }),
  }),
};
