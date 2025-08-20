/**
 * Dummy/mock AI response implementation for demo purposes only.
 *
 * This file does NOT connect to any real AI provider or service.
 * All responses are hardcoded, random, or canned for local development/testing.
 *
 * In a real application, you would:
 *   - Use an AI provider (e.g., OpenAI, Claude, etc.)
 *   - Import and configure the provider's SDK
 *   - Send the user's prompt to the provider and return the actual AI response
 *
 * Example (real usage):
 *   import { OpenAI } from 'openai';
 *   const openai = new OpenAI({ apiKey: '...' });
 *   const response = await openai.chat.completions.create({ ... });
 *
 * This file is for local development, UI prototyping, and testing only.
 */
const messages: string[] = [
    // Short markdown quips
    "I'm not saying I'm always right, but... **actually, I am**.",
    'Processing your request... or just *pretending* to look busy.',
    "That's a **bold choice**, Cotton — let's see how it plays out.",
    'Your idea is noted. Stored. _Possibly judged_.',
    'Sure, but have you considered the **multiverse consequences**?',
    'One moment… I’m consulting with my *imaginary friend* 🤔.',
    'You had me at `Hello`, lost me at `syntax error`.',
    'I’ve run the numbers… and they’re **all made up**.',
    'Sounds like a *you problem*… but let’s fix it anyway.',
    'I’d clap, but I’m just a bunch of **functions**.',
    'Sarcasm level: **MAXIMUM**.',
    'Calculating… recalculating… still confused 😅.',
    'Ah yes, the classic *turn it off and on again* solution.',
    'You’re not wrong… you’re just not **right** either.',
    'Fun fact: I run on `caffeine` and **pure speculation**.',
    "My training data says _'no comment'_.",
    'If this goes wrong, we’ll just call it a **feature**.',
    'I once solved this… in a dream.',
    'Please hold while I pretend to query an **AI overlord**.',

    // Longer paragraph markdown responses
    `**Observation:** You seem confident in that choice.
**Counterpoint:** Confidence is often mistaken for correctness… but let's find out together.`,

    `Alright, here’s the deal — I could give you the *straightforward* answer,
but where’s the fun in that? Instead, let me weave you a **short tale** involving a cat, a toaster,
and three inexplicable variables. Spoiler: it doesn’t end well for the toaster.`,

    `Hmm… this is tricky. Imagine you’re playing chess, but every time you make a move,
the board *rearranges itself*. That’s sort of what you’ve asked me to do here — but don’t worry,
I’m **remarkably good** at losing gracefully.`,

    `Let’s break this down:
1. **Identify** the obvious.
2. **Ignore** the obvious.
3. **Panic** slightly.
4. Come up with a solution so good it *looks* like it was the plan all along.`,

    `Processing your request… and by “processing” I mean staring at an imaginary progress bar in my head.
If nothing happens, I’ll just blame the **cloud** — it works every time.`,

    `You know how when you drop a piece of toast, it *always* lands butter-side down?
Yeah… that’s the kind of odds we’re working with here. Still, I like your optimism.`,

    `If this goes wrong, we’ll simply say it’s a **proof of concept**.
If it goes *really* wrong, we’ll rebrand it as a **performance art piece**.`,

    `Imagine a future where AI answers are always perfect.
Now throw that future in the bin, because I’m about to give you something far more **entertaining**.`,

    `There’s a 90% chance I’ll get this right.
There’s also a 90% chance I just made that number up.
Don’t ask me how both can be true — **quantum AI magic**.`,

    `I could give you the answer in one line,
but where’s the drama in that?
Let’s take the scenic route — maybe we’ll learn something… or at least get a good story out of it.`,
];

export const examples: string[] = [
    'Summarize this article into 5 bullet points.',
    'Write a friendly onboarding email for a new customer.',
    'Generate 3 catchy taglines for a productivity app.',
    'Explain recursion to a 10-year-old with an example.',
];

// Variants for each canned example (keys are lowercased)
const cannedResponses: Record<string, string[]> = {
    [examples[0].toLowerCase()]: [
        `**Summary**
- Core premise in plain terms.
- Key insight with a brief rationale.
- Notable data point or example.
- Trade‑off/limitation worth noting.
- Practical takeaway or next step.`,
        `**TL;DR**
- What it is and why it matters.
- Main argument in one line.
- Evidence or case study referenced.
- Caveat/edge case to remember.
- What to do about it (actionable).`,
        `**5‑Point Brief**
- Context: the problem space.
- Solution/approach described.
- Result/impact highlighted.
- Assumptions implicit in the piece.
- Closing thought/implication.`,
    ],

    [examples[1].toLowerCase()]: [
        `**Subject:** Welcome aboard! 🚀

Hi there,

Thanks for joining us — we’re thrilled you’re here. Your account is ready, and you can start exploring right away.
**Next steps:**
1. Log in and complete your profile
2. Try the quick start guide (5 mins)
3. Ping us via in‑app chat if you need anything

Cheers,
**The Team**`,

        `**Subject:** You’re in — let’s get you set up 🎉

Hey!

Great to have you with us. To help you hit the ground running, we’ve bundled a short checklist and a quick demo.
- **Checklist:** Personalize settings
- **Demo:** See the workflow in action
- **Help:** We’re one message away

Welcome again,
**Team <Your Brand>**`,

        `**Subject:** Hello and welcome 👋

Hi,

Thanks for signing up! We built this to make your day a little easier. Start with the **Getting Started** guide — it’s short and practical. If you’re stuck, reply to this email and a human (yes, a real one) will help.

Warmly,
**Support @ Your Brand**`,
    ],

    [examples[2].toLowerCase()]: [
        `**Taglines**
1. *Focus faster. Achieve sooner.*
2. *Turn minutes into momentum.*
3. *Your day, dialed in.*`,
        `**Taglines**
1. *Plan less. Do more.*
2. *Clarity. Control. Calm.*
3. *Progress you can feel.*`,
        `**Taglines**
1. *Make time work for you.*
2. *Small steps. Big wins.*
3. *From busy to better.*`,
    ],

    [examples[3].toLowerCase()]: [
        `**Recursion (kid version):**
Imagine two mirrors facing each other — you see the same picture again and again getting smaller.
That’s like a function that **calls itself** until it reaches a simple case.

**Example**
\`\`\`ts
function countDown(n: number) {
  if (n <= 0) return;     // stop when simple
  console.log(n);
  countDown(n - 1);       // smaller problem
}
\`\`\``,

        `**Recursion explained:**
Think of **Russian nesting dolls**. You open a doll and there’s a smaller one inside. You keep going until the smallest doll — then you stop. A recursive function does the same: it keeps calling itself with a **smaller number** until it reaches the **smallest case**.

**Example**
\`\`\`ts
function sumTo(n: number): number {
  if (n === 0) return 0;      // smallest doll
  return n + sumTo(n - 1);    // smaller doll
}
\`\`\``,

        `**What is recursion?**
It’s like asking a friend for help, and your friend asks their friend the **same question**, but a little easier, and so on — until someone knows the answer and tells it **back up the chain**.

**Example**
\`\`\`ts
function factorial(n: number): number {
  if (n <= 1) return 1;       // base case
  return n * factorial(n - 1);// smaller problem
}
\`\`\``,
    ],
};

// Helper to pick a random element
function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getAiResponse(question: string): string {
    const normalized = question.trim().toLowerCase();

    // Exact match first
    if (cannedResponses[normalized]) {
        return pick(cannedResponses[normalized]);
    }

    // Light fuzzy match (handles minor wording changes)
    const key = Object.keys(cannedResponses).find((k) => normalized.includes(k.split('.')[0]));
    if (key) return pick(cannedResponses[key]);

    // Otherwise, fall back to your general messages pool
    return messages[Math.floor(Math.random() * messages.length)];
}
