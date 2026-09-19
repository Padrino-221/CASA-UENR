/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, max: 5 });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const ARTICLES = [
  {
    slug: 'orientation-week-outreach-reaches-400-students',
    kind: 'Recap',
    title: 'Orientation week outreach reaches 400+ students',
    excerpt: 'Hundreds of freshers heard the good news across campus — and dozens have already plugged into the fellowship.',
    body: [
      'When the Evangelism Department planned orientation week, the prayer was simple: that every fresher arriving on campus would hear the gospel before their first lecture. God answered far beyond that prayer.',
      'Over five days, teams moved through registration queues, hostel common rooms, and faculty walkways — sharing the good news, praying with students, and inviting them into the CASA family. By the end of the week, more than four hundred students had heard a clear presentation of the gospel.',
      'The most encouraging sign was not the number of conversations, but the number of connections. Dozens of freshers joined our first Bible study of the semester the very same week, and the welcome desk has been busy ever since.',
      'To every volunteer who gave their evenings, and to every student who stopped to listen — thank you. The harvest is plentiful, and the labourers are rising.',
    ],
    quoteText: 'Declare his glory among the nations, his marvelous deeds among all peoples.',
    quoteCite: 'Psalm 96:3',
    imageUrl: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1000&h=520&fit=crop',
    meta: 'Evangelism Department · Sep 12',
    order: 0,
  },
  {
    slug: 'healed-during-the-friday-prayer-meeting',
    kind: 'Testimony',
    title: 'Healed during the Friday prayer meeting',
    excerpt: 'A final-year student shares how God completely healed her during the Prayer Force vigil.',
    body: [
      'What began as an ordinary Friday prayer meeting became a night the house will not forget. A final-year student, who had been managing a painful condition for months, was prayed for during the vigil — and testified the following week that she had been completely healed.',
      'In her own words: "I came to the meeting believing God for my healing, and I left without the pain. I have slept through the night every day since. All I can say is that Jesus still heals."',
      'The house rejoices with her and gives God the glory. Her testimony has stirred fresh faith across every department — and the Prayer Force has seen its largest attendance since the semester began.',
      'If you need someone to stand with you in prayer, the Prayer Force meets every Friday at 6:00 PM in the Chapel Annex. You do not have to carry it alone.',
    ],
    quoteText: 'And the prayer offered in faith will make the sick well; the Lord will raise them up.',
    quoteCite: 'James 5:15',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&h=520&fit=crop',
    meta: 'Prayer Force · Sep 5',
    order: 1,
  },
  {
    slug: 'freshers-registration-is-open',
    kind: 'Announcement',
    title: "Freshers' registration is open",
    excerpt: 'New on campus? Register at the welcome desk after any gathering — we would love to meet you.',
    body: [
      'A new session has begun, and if you are just arriving on campus, the CASA family wants to meet you. Registration for freshers is now open at the welcome desk after every gathering.',
      'Registering helps us plug you in quickly — into a department where your gifts can grow, a Bible study group close to your hostel, and a community that will stand with you through the session.',
      'You can also reach out to any of our executives directly, or send us a message through the contact page. Whichever way feels easiest — just do not stay a stranger.',
      'Welcome to campus. Welcome home.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1000&h=520&fit=crop',
    meta: 'Executive Council · Sep 1',
    order: 2,
  },
  {
    slug: 'departmental-meetings-resume',
    kind: 'Announcement',
    title: 'Departmental meetings resume',
    excerpt: 'All six departments resume weekly meetings this week — check the notice board for your new time and venue.',
    body: [
      'All six departments resume their weekly meetings this week. Choir, Prayer Force, Evangelism, Media & Tech, Welfare, and Ushering & Protocol each have a refreshed schedule for the new session.',
      'Coordinators have posted the new times and venues on the Chapel Annex notice board. If you have not yet joined a department, it is not too late — visit the join page, pick where you fit, and speak to any coordinator after a gathering.',
      'Every member is a minister. This session, find your place of service and put your gift to work in the house of God.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1000&h=520&fit=crop',
    meta: 'Executive Council · Aug 30',
    order: 3,
  },
];

const LEADERS = [
  { initials: 'OA', name: 'Oluwaseun Adeyemi', role: 'President', bio: "Coordinates the fellowship's vision and chairs the executive council.", color: 'brand', order: 0 },
  { initials: 'CB', name: 'Chiamaka Balogun', role: 'Vice President', bio: 'Oversees welfare and supports every arm of the ministry.', color: 'lime', order: 1 },
  { initials: 'TE', name: 'Tunde Eze', role: 'General Secretary', bio: 'Keeps the house informed, organised, and on record.', color: 'violet', order: 2 },
  { initials: 'FO', name: 'Faith Okafor', role: 'Bible Study Coordinator', bio: 'Plans and teaches our weekly study of the Word.', color: 'teal', order: 3 },
];

const EVENTS = [
  { month: 'Sep', day: '26', kind: 'Outreach', title: 'Campus Evangelism Drive', text: 'Teams head out across hostels and faculties to share the good news and pray with students.', meta: 'Meet at Chapel Annex · 4:00 PM', order: 0 },
  { month: 'Oct', day: '02', kind: 'Fellowship', title: "Freshers' Welcome Night", text: 'Worship, testimonies, and dinner to welcome the new intake into the CASA family.', meta: 'Main Auditorium · 6:00 PM', order: 1 },
  { month: 'Oct', day: '16', kind: 'Retreat', title: 'Annual Campus Retreat', text: 'Three days away with God — teachings, workshops, and communion at the mountain.', meta: 'C.A.C. Camp Ground · Oct 16–18', order: 2 },
];

async function main() {
  const articleCount = await db.siteArticle.count();
  if (articleCount === 0) {
    for (const article of ARTICLES) {
      await db.siteArticle.create({
        data: { ...article, body: JSON.stringify(article.body), published: true },
      });
    }
    console.log(`Seeded ${ARTICLES.length} articles.`);
  } else {
    console.log(`Skipped articles (${articleCount} already present).`);
  }

  const eventCount = await db.siteEvent.count();
  if (eventCount === 0) {
    for (const event of EVENTS) {
      await db.siteEvent.create({ data: { ...event, published: true } });
    }
    console.log(`Seeded ${EVENTS.length} events.`);
  } else {
    console.log(`Skipped events (${eventCount} already present).`);
  }

  const leaderCount = await db.siteLeader.count();
  if (leaderCount === 0) {
    for (const leader of LEADERS) {
      await db.siteLeader.create({ data: { ...leader, published: true } });
    }
    console.log(`Seeded ${LEADERS.length} leaders.`);
  } else {
    console.log(`Skipped leaders (${leaderCount} already present).`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
