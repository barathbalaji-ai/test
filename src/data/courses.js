// Taxonomy + course seed data for Carta.
// Swap each course `link` for a real Google Drive share URL (anyone in the
// freshworks.com domain who is signed in can open it).

export const TRACKS = [
  'Foundations',
  'Product Mastery',
  'Communication',
  'Tools & Systems',
  'Leadership',
]

// Each product carries a palette colour used for tags/dots across the app.
export const PRODUCTS = [
  { id: 'all', name: 'All products', color: '#1A1712' },
  { id: 'freshdesk', name: 'Freshdesk', color: '#1F6FEB' },
  { id: 'freshservice', name: 'Freshservice', color: '#0E8F6E' },
  { id: 'freshchat', name: 'Freshchat', color: '#7A3FF2' },
  { id: 'freshcaller', name: 'Freshcaller', color: '#C2410C' },
  { id: 'freshsales', name: 'Freshsales', color: '#B91C5C' },
  { id: 'freshbots', name: 'Freshbots', color: '#0E7490' },
  { id: 'enablement', name: 'Enablement', color: '#8E2A20' },
]

export const productById = (id) => PRODUCTS.find((p) => p.id === id) || PRODUCTS[0]

// PLACEHOLDER Drive links — replace `link` with real share URLs.
export const COURSES = [
  {
    id: 'ai-recommendations',
    title: 'AI Recommendations',
    track: 'Tools & Systems',
    level: 'Intermediate',
    productIds: ['all'],
    duration: '18 min',
    lessons: 4,
    blurb:
      'Delivering delight became a whole lot easier with the new AI Recommendations App — surface the next best action without leaving the ticket.',
    link: 'https://drive.google.com/drive/folders/PLACEHOLDER-ai-recommendations',
    quiz: [
      {
        q: 'What is the core promise of the AI Recommendations App?',
        options: [
          'It replaces the agent entirely',
          'It surfaces a next best action inside the ticket',
          'It auto-closes tickets after 24h',
          'It only works in Freshsales',
        ],
        correct: 1,
      },
      {
        q: 'Where do recommendations appear?',
        options: ['In a separate portal', 'In email only', 'Within the agent workspace / ticket', 'On the customer side'],
        correct: 2,
      },
      {
        q: 'What should an agent always do with a recommendation?',
        options: [
          'Apply it blindly',
          'Ignore it',
          'Use judgement and verify before acting',
          'Escalate it',
        ],
        correct: 2,
      },
    ],
  },
  {
    id: 'freshdesk-omni-intro',
    title: 'Freshdesk Omni — Intro',
    track: 'Product Mastery',
    level: 'Beginner',
    productIds: ['freshdesk', 'freshchat', 'freshbots', 'freshcaller'],
    duration: '22 min',
    lessons: 5,
    blurb:
      'Dive into the world of Freshdesk Omni, our latest CX offering that brings ticketing, chat, bots and voice under one roof.',
    link: 'https://drive.google.com/drive/folders/PLACEHOLDER-omni-intro',
    quiz: [
      {
        q: 'Freshdesk Omni unifies which channels?',
        options: ['Only email', 'Ticketing, chat, bots and voice', 'Social media only', 'SMS only'],
        correct: 1,
      },
      {
        q: 'Omni is best described as…',
        options: ['A standalone chat tool', 'A converged CX offering', 'A CRM', 'A billing system'],
        correct: 1,
      },
      {
        q: 'Who benefits most from a unified workspace?',
        options: ['Only managers', 'Agents handling multiple channels', 'Only developers', 'Nobody'],
        correct: 1,
      },
    ],
  },
  {
    id: 'freshdesk-omni-walkthrough',
    title: 'Freshdesk Omni — Walkthrough',
    track: 'Product Mastery',
    level: 'Intermediate',
    productIds: ['freshdesk', 'freshchat', 'freshbots', 'freshcaller'],
    duration: '27 min',
    lessons: 6,
    blurb:
      'A hands-on walkthrough of the differences between the standalone Freshdesk and the new Omni experience.',
    link: 'https://drive.google.com/drive/folders/PLACEHOLDER-omni-walkthrough',
    quiz: [
      {
        q: 'What is a key difference of Omni vs standalone Freshdesk?',
        options: ['No tickets', 'Converged multi-channel workspace', 'Fewer features', 'No reporting'],
        correct: 1,
      },
      {
        q: 'In Omni, conversations across channels are…',
        options: ['Siloed', 'Brought together for the agent', 'Deleted', 'Read-only'],
        correct: 1,
      },
      {
        q: 'Migrating from standalone should consider…',
        options: ['Nothing', 'Existing workflows and automations', 'Only the logo', 'Only pricing'],
        correct: 1,
      },
    ],
  },
  {
    id: 'cultural-awareness',
    title: 'Cultural Awareness',
    track: 'Foundations',
    level: 'Beginner',
    productIds: ['all'],
    duration: '15 min',
    lessons: 3,
    blurb:
      'Embrace the diverse world of customers. Build the empathy and acceptance that turns a good interaction into a great one.',
    link: 'https://drive.google.com/drive/folders/PLACEHOLDER-cultural-awareness',
    quiz: [
      {
        q: 'Cultural awareness in support is mainly about…',
        options: ['Memorising rules', 'Empathy and acceptance', 'Speaking faster', 'Avoiding customers'],
        correct: 1,
      },
      {
        q: 'A culturally aware agent…',
        options: ['Assumes intent', 'Adapts tone to the customer', 'Ignores context', 'Uses jargon'],
        correct: 1,
      },
      {
        q: 'Why does diversity matter in CX?',
        options: ['It does not', 'Customers come from many backgrounds', 'Only for marketing', 'For legal reasons only'],
        correct: 1,
      },
    ],
  },
  {
    id: 'itam-readiness',
    title: 'ITAM Readiness',
    track: 'Product Mastery',
    level: 'Intermediate',
    productIds: ['freshservice'],
    duration: '20 min',
    lessons: 4,
    blurb:
      'Get ready for IT Asset Management in Freshservice — discover, track and govern assets across their lifecycle.',
    link: 'https://drive.google.com/drive/folders/PLACEHOLDER-itam-readiness',
    quiz: [
      {
        q: 'ITAM stands for…',
        options: ['IT Access Management', 'IT Asset Management', 'Internal Team Admin', 'IT Audit Mode'],
        correct: 1,
      },
      {
        q: 'ITAM in Freshservice helps you…',
        options: ['Discover and track assets', 'Send invoices', 'Run ad campaigns', 'Build chatbots'],
        correct: 0,
      },
      {
        q: 'Asset lifecycle governance reduces…',
        options: ['Visibility', 'Risk and waste', 'Customer trust', 'Uptime'],
        correct: 1,
      },
    ],
  },
]

export const courseById = (id) => COURSES.find((c) => c.id === id)
