# FeedMe Order Bot — McDonald's Cooking Bot Controller

A frontend prototype of McDonald's automated cooking bot order controller.

## Overview

Customers submit orders (Normal or VIP), bots pick them up from the **PENDING** queue, process each order for 10 seconds, and move it to **COMPLETE**. Managers can scale the bot fleet up or down at any time, and the app respects VIP priority and order-return semantics when bots are removed mid-process.

All state is kept in memory — no backend, no persistence.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 5** for dev server and build
- **Zustand** for state management
- **Vitest** for unit tests

## Features

Implements all requirements from the assignment:

1. **New Normal Order** — adds an order to the bottom of PENDING.
2. **New VIP Order** — inserted ahead of all Normal orders but behind existing VIP orders.
3. **Unique, increasing order numbers** across the session.
4. **+ Bot** — spawns a bot that immediately picks up a PENDING order; the order moves to COMPLETE after 10 seconds, then the bot grabs the next one.
5. **Idle bots** — when no PENDING orders remain, the newly freed bot becomes IDLE.
6. **- Bot** — removes the newest bot. If it was processing, that order is returned to PENDING in its original priority slot (VIP stays ahead of Normal).
7. **In-memory only** — no database, no persistence.

Plus a **PROCESSING** column so you can watch orders in flight alongside PENDING and COMPLETE.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Open http://localhost:5173

### Other scripts

```bash
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build locally
npm run type-check   # tsc --noEmit
npm run test         # vitest run
npm run test:watch   # vitest in watch mode
```

## How It Works

- **Queueing** — `utils/queue.ts` places a new VIP order after the last VIP in PENDING, and a Normal order at the end. This keeps priority stable regardless of insertion order.
- **Scheduling** — `store/scheduler.ts` runs whenever the queue or bot fleet changes. Any IDLE bot is paired with the front of PENDING, the order moves to PROCESSING, and a 10-second timer is set.
- **Bot removal** — removing the newest bot cancels its timer (if any). Its in-flight order is reinserted into PENDING using the same VIP-aware rules, so it lands in the correct slot.
- **Progress UI** — `hooks/useNow.ts` ticks every ~250ms so processing orders show a live progress bar.

## License

See [LICENSE](./LICENSE).
