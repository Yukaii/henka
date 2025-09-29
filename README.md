# Henka · Chord Ear Trainer

Henka is an interactive ear-training companion that helps musicians internalize chord progressions. The app pairs guided listening drills with instant feedback so players can move between Roman numeral analysis and absolute chord names with confidence.

## Project Goal
- Provide a focused practice environment for hearing and naming jazz-pop chord progressions through repeatable listening, answering, and review cycles.

## Core Features
- Dual training modes for Roman numerals (`Transpose`) and absolute chord names (`Absolute`).
- Layered difficulty levels plus a customizable tier for building progression mixes with extended harmony, inversion, altered degrees (e.g., bII, bV), and voice-leading controls.
- Real-time Web Audio engine with switchable sampled instruments and optional smoothing between chords.
- Progress dashboard that tracks accuracy, streaks, achievements, and recent trends across sessions.
- Customisable practice settings covering language (English, Japanese, Traditional Chinese), instrument choice, debug helpers, and question sets.
- Responsive Next.js UI with quick-setup flow, detailed session feedback, and replayable audio controls.

## Tech Stack
- Next.js 14 with React 18 and TypeScript
- Tailwind CSS utility styling with Radix UI primitives
- Custom audio playback layer built on the Web Audio API
- Node `node:test` suite compiled via TypeScript for unit coverage

## Development
- `npm run dev` – start the local development server
- `npm run build` – create a production build
- `npm run lint` – run ESLint with the project rules
- `npm run test` – compile and execute the automated test suite

## Deployment
The production deployment is hosted on Vercel: https://vercel.com/ykpersonal/v0-chord-ear-trainer
