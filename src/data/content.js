// Posters, calendar sessions, session-type metadata and article helpers.

// ---- Posters --------------------------------------------------------------
// Drop real artwork into public/posters/ and set `img` to e.g. '/posters/chat-etiquette.jpg'.
// Cards without an image render a generative motif fallback (see PosterCard).
// The posters bound into the Support Codex book. (I Belong and the Q1 Programs
// playbook are their own books — see src/data/books.js.)
export const POSTERS = [
  { id: 'check-calendar', title: 'Check Your Calendar', category: 'Mindset', caption: 'Meeting etiquette in black and white — respond Yes/No and show up ready.', img: '/posters/check-calendar.jpg' },
  { id: 'punctuality', title: 'Punctuality', category: 'Mindset', caption: 'The first deliverable — after all, the early bird gets the worm.', img: '/posters/punctuality.jpg' },
  { id: 'missing-agent', title: 'The Missing Agent', category: 'Mindset', caption: 'A detective-board look at what goes missing on a call.', img: '/posters/missing-agent.jpg' },
  { id: 'on-time-is-late', title: 'On Time Is Late', category: 'Mindset', caption: 'Get on your call early — set up for a smooth start.', img: '/posters/on-time-is-late.jpg' },
  { id: 'make-notes', title: 'Make Notes', category: 'Craft', caption: 'Document the call — or let AI assist with the MoM.', img: '/posters/make-notes.jpg' },
  { id: 'chat-etiquette', title: 'Chat Etiquette', category: 'Craft', caption: 'Small habits that make a chat feel human.', img: '/posters/chat-etiquette.jpg' },
  { id: 'ai-guidelines', title: 'AI Guidelines', category: 'Communication', caption: 'Using AI with care in your support journey.', img: '/posters/ai-guidelines.jpg' },
]

export const POSTER_CATEGORIES = ['All', 'Craft', 'Mindset', 'Communication']

// ---- Calendar sessions ----------------------------------------------------
export const SESSION_TYPES = [
  { id: 'New product', label: 'New product', color: '#1F6FEB' },
  { id: 'Behavioural', label: 'Behavioural', color: '#0E8F6E' },
  { id: 'Feature Launches', label: 'Feature Launches', color: '#E0382B' },
  { id: 'Leadership', label: 'Leadership', color: '#7A3FF2' },
]

export const sessionTypeColor = (type) =>
  (SESSION_TYPES.find((t) => t.id === type) || {}).color || '#524D43'

// Real seed sessions only (do not invent extra sessions).
export const SEED_EVENTS = [
  {
    id: 'evt-stakeholder-15',
    name: 'Stakeholder Engagement',
    short: 'Stakeholders',
    date: '2026-06-15',
    time: '10:30–18:30',
    duration: '1 day',
    location: 'Chennai',
    room: 'Virat Kohli',
    productIds: ['all'],
    type: 'Behavioural',
    trainer: 'Varsha Balakrishnan / Sreejith Murali / Anushree Francisca',
    seats: 24,
  },
  {
    id: 'evt-storytelling-16',
    name: 'Data Infused Storytelling',
    short: 'Storytelling',
    date: '2026-06-16',
    endDate: '2026-06-17',
    time: '14:30–20:30',
    duration: '2 days',
    location: 'Chennai',
    room: 'Sachin Tendulkar',
    productIds: ['all'],
    type: 'Leadership',
    trainer: 'External',
    seats: 20,
  },
  {
    id: 'evt-stakeholder-19',
    name: 'Stakeholder Engagement',
    short: 'Stakeholders',
    date: '2026-06-19',
    time: '10:30–18:30',
    duration: '1 day',
    location: 'Chennai',
    room: 'Virat Kohli',
    productIds: ['all'],
    type: 'Behavioural',
    trainer: 'Varsha Balakrishnan / Sreejith Murali / Anushree Francisca',
    seats: 24,
  },
]
