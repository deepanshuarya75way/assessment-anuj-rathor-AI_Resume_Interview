const { z } = require("zod");

const experienceSchema = z.object({
  title: z.string().max(100),
  company: z.string().max(100),
  location: z.string().optional(),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  points: z.array(
    z.string().max(300)
  ).default([])
});

const projectSchema = z.object({
  name: z.string().max(100),

  role: z.string().optional(),

  stack: z.string().optional(),

  liveUrl: z.string().optional(),

  githubUrl: z.string().optional(),

  points: z.array(
    z.string().max(300)
  ).default([])
});

const educationSchema = z.object({
  school: z.string().max(120),

  degree: z.string().max(120),

  location: z.string().optional(),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  score: z.string().optional()
});

const ResumeSchema = z.object({
  name: z.string()
    .min(2)
    .max(100),

  role: z.string()
    .max(100)
    .optional(),

  email: z.string()
    .email()
    .max(120),

  phone: z.string()
    .max(30)
    .optional(),

  linkedin: z.string()
    .optional(),

  github: z.string()
    .optional(),

  leetcode: z.string()
    .optional(),

  portfolio: z.string()
    .optional(),

  location: z.string()
    .max(100)
    .optional(),

  summary: z.string()
    .max(1000)
    .optional(),

  template: z.string()
    .default("modern"),

  skills: z.array(
    z.string().max(50)
  ).default([]),

  certifications: z.array(
    z.string().max(200)
  ).default([]),

  experience: z.array(
    experienceSchema
  ).default([]),

  projects: z.array(
    projectSchema
  ).default([]),

  education: z.array(
    educationSchema
  ).default([]),

  sectionOrder: z.array(
    z.string()
  ).default([])
});

module.exports = {
  ResumeSchema
};