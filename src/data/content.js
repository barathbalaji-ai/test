// Posters, calendar sessions, session-type metadata and article helpers.

// ---- Posters --------------------------------------------------------------
// Drop real artwork into public/posters/ and set `img` to e.g. '/posters/chat-etiquette.jpg'.
// Cards without an image render a generative motif fallback (see PosterCard).
export const POSTERS = [
  {
    id: 'chat-etiquette',
    title: 'Chat Etiquette',
    category: 'Craft',
    kind: 'bookmark',
    caption: 'Small habits that make a chat feel human.',
    img: '/posters/chat-etiquette.jpg',
  },
  {
    id: 'i-belong',
    title: 'I Belong',
    category: 'Mindset',
    kind: 'guidebook',
    caption: 'A Personal Playbook for Influence & Impact.',
    img: '/posters/i-belong.jpg',
  },
  {
    id: 'check-your-calendar',
    title: 'Check Your Calendar',
    category: 'Mindset',
    kind: 'black',
    caption: 'Meeting etiquette, in black and white.',
    img: '/posters/check-your-calendar.jpg',
  },
  {
    id: 'punctuality',
    title: 'Punctuality',
    category: 'Mindset',
    kind: 'illustration',
    caption: 'Is the first deliverable.',
    img: '/posters/punctuality.jpg',
  },
  {
    id: 'the-missing-agent',
    title: 'The Missing Agent',
    category: 'Mindset',
    kind: 'detective',
    caption: 'A detective-board look at what goes missing.',
    img: '/posters/the-missing-agent.jpg',
  },
  {
    id: 'ai-guidelines',
    title: 'AI Guidelines',
    category: 'Communication',
    kind: 'rules',
    caption: 'Five rules for using AI with care.',
    img: '/posters/ai-guidelines.jpg',
  },
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
