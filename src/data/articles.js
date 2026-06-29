// Articles feed. Lead = the month's product launches. Feed = real Freshworks
// release-note articles (title=module, excerpt=description, category=product).
// PLACEHOLDER URLs — point a scraper at the team's "Support Learning Repository"
// → Feature Releases sheet → rows whose "Articles" column holds a real https link.

export const LAUNCHES = {
  id: 'june-launches',
  kicker: 'June launches are live',
  title: 'What shipped this month',
  dek: 'Three big moves for Customer Support — converged CX, IT asset management, and AI that meets agents inside the ticket.',
  items: [
    {
      name: 'Freshdesk Omni',
      note: 'Ticketing, chat, bots and voice converge into one agent workspace.',
    },
    {
      name: 'ITAM in Freshservice',
      note: 'Discover, track and govern IT assets across their full lifecycle.',
    },
    {
      name: 'AI Recommendations App',
      note: 'Surfaces the next best action without leaving the ticket.',
    },
  ],
}

export const ARTICLE_CATEGORIES = [
  'All',
  'Freshdesk',
  'Freshservice',
  'Freshchat',
  'Freshcaller',
  'Freshsales',
  'Freshbots',
]

// ~ release-note feed. Replace `url` with the real support-portal links.
export const ARTICLES = [
  { id: 'a1', name: 'Custom Ticket Statuses', category: 'Freshdesk', excerpt: 'Define your own ticket statuses to mirror how your team actually works.', url: 'https://support.freshdesk.com/support/solutions/PLACEHOLDER-1' },
  { id: 'a2', name: 'Thread-level Collaboration', category: 'Freshdesk', excerpt: 'Loop in teammates on a specific thread without forwarding the whole ticket.', url: 'https://support.freshdesk.com/support/solutions/PLACEHOLDER-2' },
  { id: 'a3', name: 'Unified Agent Workspace', category: 'Freshdesk', excerpt: 'Handle email, chat and calls from a single converged inbox in Omni.', url: 'https://support.freshdesk.com/support/solutions/PLACEHOLDER-3' },
  { id: 'a4', name: 'Asset Discovery Agent', category: 'Freshservice', excerpt: 'Automatically discover hardware and software assets on your network.', url: 'https://support.freshservice.com/support/solutions/PLACEHOLDER-4' },
  { id: 'a5', name: 'Contract Management', category: 'Freshservice', excerpt: 'Track vendor contracts, renewals and warranties alongside your assets.', url: 'https://support.freshservice.com/support/solutions/PLACEHOLDER-5' },
  { id: 'a6', name: 'Workflow Automator Templates', category: 'Freshservice', excerpt: 'Start from prebuilt automations for common IT service requests.', url: 'https://support.freshservice.com/support/solutions/PLACEHOLDER-6' },
  { id: 'a7', name: 'Proactive Messaging', category: 'Freshchat', excerpt: 'Trigger contextual messages based on what a visitor is doing.', url: 'https://support.freshchat.com/support/solutions/PLACEHOLDER-7' },
  { id: 'a8', name: 'Conversation Topics', category: 'Freshchat', excerpt: 'Auto-tag conversations by topic for cleaner reporting.', url: 'https://support.freshchat.com/support/solutions/PLACEHOLDER-8' },
  { id: 'a9', name: 'Inline Translation', category: 'Freshchat', excerpt: 'Reply in your language; the customer reads in theirs.', url: 'https://support.freshchat.com/support/solutions/PLACEHOLDER-9' },
  { id: 'a10', name: 'Call Recording Controls', category: 'Freshcaller', excerpt: 'Granular controls for when and how calls are recorded.', url: 'https://support.freshcaller.com/support/solutions/PLACEHOLDER-10' },
  { id: 'a11', name: 'Smart Escalations', category: 'Freshcaller', excerpt: 'Route unanswered calls to the right backup automatically.', url: 'https://support.freshcaller.com/support/solutions/PLACEHOLDER-11' },
  { id: 'a12', name: 'Voicemail Transcription', category: 'Freshcaller', excerpt: 'Read voicemails as text right inside the ticket.', url: 'https://support.freshcaller.com/support/solutions/PLACEHOLDER-12' },
  { id: 'a13', name: 'Deal Insights', category: 'Freshsales', excerpt: 'AI-scored deals so reps focus where it counts.', url: 'https://support.freshsales.com/support/solutions/PLACEHOLDER-13' },
  { id: 'a14', name: 'Sequences 2.0', category: 'Freshsales', excerpt: 'Multi-step outreach with branching based on engagement.', url: 'https://support.freshsales.com/support/solutions/PLACEHOLDER-14' },
  { id: 'a15', name: 'Custom Modules', category: 'Freshsales', excerpt: 'Model your own objects beyond contacts and deals.', url: 'https://support.freshsales.com/support/solutions/PLACEHOLDER-15' },
  { id: 'a16', name: 'Bot Flow Builder', category: 'Freshbots', excerpt: 'Drag-and-drop flows for self-service resolution.', url: 'https://support.freshworks.com/support/solutions/PLACEHOLDER-16' },
  { id: 'a17', name: 'Intent Detection', category: 'Freshbots', excerpt: 'Understand what a customer wants from the first message.', url: 'https://support.freshworks.com/support/solutions/PLACEHOLDER-17' },
  { id: 'a18', name: 'Bot Analytics', category: 'Freshbots', excerpt: 'Measure containment and where flows drop off.', url: 'https://support.freshworks.com/support/solutions/PLACEHOLDER-18' },
  { id: 'a19', name: 'Canned Responses Revamp', category: 'Freshdesk', excerpt: 'Faster search and folders for your saved replies.', url: 'https://support.freshdesk.com/support/solutions/PLACEHOLDER-19' },
  { id: 'a20', name: 'SLA Reminders', category: 'Freshdesk', excerpt: 'Nudge agents before an SLA is about to breach.', url: 'https://support.freshdesk.com/support/solutions/PLACEHOLDER-20' },
  { id: 'a21', name: 'Service Catalog UI', category: 'Freshservice', excerpt: 'A cleaner catalog that customers actually browse.', url: 'https://support.freshservice.com/support/solutions/PLACEHOLDER-21' },
  { id: 'a22', name: 'Co-browsing', category: 'Freshchat', excerpt: 'See the customer screen to resolve faster, with consent.', url: 'https://support.freshchat.com/support/solutions/PLACEHOLDER-22' },
  { id: 'a23', name: 'Power Dialer', category: 'Freshcaller', excerpt: 'Queue and dial a list of numbers back-to-back.', url: 'https://support.freshcaller.com/support/solutions/PLACEHOLDER-23' },
  { id: 'a24', name: 'Territory Management', category: 'Freshsales', excerpt: 'Assign leads by region, size or product automatically.', url: 'https://support.freshsales.com/support/solutions/PLACEHOLDER-24' },
]
