---
name: plannify
description: Plan a feature end-to-end, breaking it down into steps and listing files created/modified for each step. Use when user wants to plan a feature, break down a design, or create a roadmap.
---

## Preparation

Before planning, make sure to deep dive into the feature and reach a shared understanding of the requirements and design. Use the `deep-dive` skill to ask detailed questions and explore the design space until all aspects are clear.

## Planning

When planning a feature, break it down into clear, actionable steps. Each step should ideally be a vertical slice of the feature that can be developed and tested independently.
Each step should be sub-feature shippable in production or at least in a shared branch.

Prefer complete steps including frontend and backend development rather than separating them into a backend step and a frontend step. 

For example : for a new page admin, use step 1 to create the authentication layer and the frontend page scaffold, step 2 the top part of the page, step 3 the main contact, etc.

Each step should be easy to review and test. If a step is too large, break it down further.

This allows for a more holistic approach to feature development and better context for each step.

For each step, list the files that will be created or modified. This helps keep track of the changes and ensures that all necessary files are accounted for in the implementation.

## Execution

When executing a plan, after completing each step :
- mark it complete (✅) in the plan file and list the files created/modified under that step.
- if any entities were changed, update the `documentation/database.uml` file to reflect those changes.
- ask for human validation and review before proceding to the next step. This allows for feedback and adjustments to be made early in the process.

Always execute the steps one by one and ask for my green light before moving on.
Do not code the whole feature at once if not explicitely asked to.

When feature is fully developed, move the plan file in the `documentation/plans/done/` directory.
