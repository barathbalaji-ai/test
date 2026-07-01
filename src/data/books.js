// The Posters room is a shelf of books. Each opens into the same page-turning
// reader (hardcover → spreads).
//   - a "poster" book:  each spread is a poster (left) + its name/description (right)
//   - a "doc" book:      the pages of a document, rendered two-up like a real book
import { POSTERS } from './content.js'

export const BOOKS = [
  {
    id: 'support-codex',
    title: 'Support Codex',
    subtitle: 'Reminders for the team room',
    cover: '/support_codex_mandala.png',
    spine: '#1b130e',
    type: 'poster',
    posters: POSTERS,
  },
  {
    id: 'i-belong',
    title: 'I Belong',
    subtitle: 'A personal playbook for influence & impact',
    cover: '/posters/i-belong.jpg',
    spine: '#2a3a53',
    type: 'doc',
    dir: '/books/i-belong',
    pages: 28,
    download: '/guides/i-belong.pdf',
  },
  {
    id: 'q1-programs',
    title: 'Q1 Programs',
    subtitle: 'The quarter’s enablement playbook',
    cover: '/posters/q1-playbook.jpg',
    spine: '#3a2f1c',
    type: 'doc',
    dir: '/books/q1',
    pages: 34,
    download: '/guides/q1-programs-playbook.pdf',
  },
]

// page image url for a doc book, 1-indexed
export const docPage = (book, i) => `${book.dir}/${String(i).padStart(2, '0')}.jpg`
