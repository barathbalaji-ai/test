// Course-video seed (fallback when the Videos sheet URL is empty).
// Sourced from the Site Video Section sheet. Each card is a thumbnail that opens
// the external course (Mindtickle / Drive) in a new tab — no in-site tracking.
// `thumbnail` is a public image path or URL; empty renders a titled fallback.
import { matchProducts } from './taxonomy.js'

const RAW = [
  { title: 'Intro to Model Context Protocol', desc: 'A deepdive into what MCP is, and how it benefits our product', product: 'All', link: 'https://deeplinks.mindtickle.com/GJHJne8z92b' },
  { title: 'DEX, XLAs, Change Risk Management', desc: 'Walkthrough of H1 releases for DEX Integration, XLAs and Change Risk', product: 'Freshservice', link: 'https://deeplinks.mindtickle.com/uP19HvuMB3b' },
  { title: 'Executive Overview Insights', desc: 'Walkthrough of a brand new feature, Executive Overview Insights', product: 'Freshservice', link: 'https://deeplinks.mindtickle.com/zBQiFwENB3b' },
  { title: 'Freshdesk Omni', desc: 'Deep dive into how the new Freshdesk Omni changes and improvements to SLAs/Groups', product: 'Freshdesk, Freshchat', link: 'https://deeplinks.mindtickle.com/Hvt2Go88tZb' },
  { title: 'Service Health Monitoring', desc: 'Walkthrough of a remastered Service Health Monitor powered by D42', product: 'Freshservice', link: 'https://deeplinks.mindtickle.com/sO5YPPSxp4b' },
  { title: 'AI Agent Studio EX', desc: 'Walkthrough of AI Agent 2.0', product: 'Freshservice', link: 'https://deeplinks.mindtickle.com/UMPUu3rMB3b' },
  { title: 'Conversational Insights', desc: 'Product walkthrough on the new conversational insights', product: 'Freshdesk, Freshchat, Freshbots', link: 'https://deeplinks.mindtickle.com/1M3ixfWWE1b' },
  { title: 'Meeting Etiquettes', desc: 'A quick run through on Meeting Etiquettes that will help you have productive conversations and build a lasting impression', product: 'All', link: 'https://deeplinks.mindtickle.com/JYsFces47Zb' },
  { title: 'Be Audacious', desc: 'What does it mean to set Audacious Goals?', product: 'All', link: 'https://drive.google.com/file/d/1yUd3_Qmr3WpNyxVi0Aezl7nl6nWpSBes/view?usp=sharing' },
  { title: 'Freshdesk Product Training', desc: 'Your complete guide to learning the Freshdesk Product', product: 'Freshdesk', link: 'https://deeplinks.mindtickle.com/QkxoLKm6rPb' },
  { title: 'Freshchat Product Training', desc: 'Your complete guide to learning the Freshchat Product', product: 'Freshchat', link: 'https://deeplinks.mindtickle.com/HXLY3E2qtSb' },
  { title: 'Cultural Awareness Training', desc: 'How do you best show up to have conversation with people from a variety of backgrounds? Jump in to learn how we can be culturally aware, sensitive and responsible!', product: 'All', link: 'https://deeplinks.mindtickle.com/plvJlom4pYb' },
  { title: 'Time Management', desc: 'A complete grasp on our time not only makes you productive but also a favorite to work with', product: 'All', link: 'https://deeplinks.mindtickle.com/pn6D0yXcKMb' },
  { title: 'AI Recommendations App', desc: 'An explainer to help you get the best out of AI in your support journey', product: 'All', link: 'https://deeplinks.mindtickle.com/uSpgnOm2vWb' },
  { title: 'Guidelines for AI usage', desc: 'A quick run down on all things to be aware before jumping into the world of AI', product: 'All', link: 'https://deeplinks.mindtickle.com/PGYQQvR10Pb' },
]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const VIDEOS = RAW.map((v) => ({
  id: slug(v.title),
  title: v.title,
  blurb: v.desc,
  productLabel: v.product,
  productIds: matchProducts(v.product),
  link: v.link,
  thumbnail: '', // drop an image path/URL here (or via the sheet) when ready
}))
