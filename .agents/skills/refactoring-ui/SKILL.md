---
name: refactoring-ui
description: Design heuristics and principles based on Refactoring UI (Adam Wathan & Steve Schoger) to eliminate "AI slop", improve visual hierarchy, clean up clutter, and polish Tailwind/React interfaces into production-grade design.
---

# Refactoring UI — De-slopping & Polishing Web Interfaces

This skill provides practical heuristics from *Refactoring UI* by Adam Wathan & Steve Schoger to eliminate common "AI slop" patterns in developer- and AI-generated interfaces.

## 1. Eliminate "AI Slop" Anti-Patterns

- **No Useless Placeholder / Filler Text**: Avoid repeating generic captions like *"Dados do sistema atualizados com as informações mais recentes"* across cards. If a label or value is self-explanatory, let it breathe; don't add text just to fill space.
- **Stop Wrapping Everything in Loud Borders**: AI models love putting `border-primary` or bright borders on search inputs, icon boxes, cards, and buttons. Borders create visual noise. Prefer clean backgrounds, subtle dividers (`border-slate-100` or `border-zinc-200/60`), or clean whitespace.
- **Kill the "Pill Overload"**: Don't make every button, input, search bar, dropdown, and badge `rounded-full`. Use deliberate border radiuses (`rounded-lg` or `rounded-md` for inputs and buttons; preserve pills only for tags/chips where appropriate).
- **Avoid Over-Communicating Status**: Don't use a thick colored left border (`border-l-4`) + tinted background + colored avatar ring + colored badge all on the same item. Pick *one* clear, subtle indicator (e.g. a discreet status badge or a subtle accent dot).

## 2. Visual Hierarchy Over Color

- **Establish Primary vs. Secondary CTAs**:
  - Never place two identical solid primary-colored buttons side-by-side.
  - The main action gets the solid brand background. Secondary actions should be outline or ghost/subtle buttons.
- **Hierarchy with Typography & Weight, Not Just Colors**:
  - Use contrast in font size, font weight, and muted tones (`text-slate-900` vs `text-slate-500` or `text-zinc-400`) instead of making everything a different saturated hue.
  - De-emphasize secondary metadata (dates, IDs, helper info) with smaller text and muted slate/gray colors.

## 3. Cards and Metrics (KPIs)

- **Icons in Metric Cards**:
  - Don't wrap every icon in an identical brightly outlined colored box.
  - Use soft, low-contrast tinted icon backgrounds (e.g., `bg-slate-100 text-slate-600` or subtle semantic tints `bg-amber-50 text-amber-600` when meaningful).
- **Number Sizing**:
  - Numbers are the hero of a KPI card. Give them prominence (`text-3xl font-bold tracking-tight text-slate-900 dark:text-white`).
  - Keep labels clean and concise.

## 4. Tables and Lists

- **Header Treatment**:
  - Table headers should be subtle, uppercase or muted (`text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/75 dark:bg-zinc-800/50`).
- **Row Actions**:
  - Avoid boxing every action icon in a bordered square in every single row.
  - Use ghost icon buttons with subtle hover effects (`hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700`).
- **Spacing and Alignment**:
  - Align numbers to the right or use `tabular-nums`.
  - Maintain consistent vertical padding across rows for breathing room.

## 5. Color Restraint

- Reserve saturated brand colors for focal points (primary CTA, active navigation, key data highlights).
- Use a coherent neutral scale (e.g. Slate or Zinc) for background, borders, and text hierarchy.

