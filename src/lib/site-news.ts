export type SiteArticle = {
  slug: string;
  kind: 'Recap' | 'Testimony' | 'Announcement';
  title: string;
  excerpt: string;
  body: string[];
  quote?: { text: string; cite: string };
  image?: string;
  meta: string;
};

export const SITE_ARTICLES: SiteArticle[] = [
  {
    slug: 'orientation-week-outreach-reaches-400-students',
    kind: 'Recap',
    title: 'Orientation week outreach reaches 400+ students',
    excerpt:
      'Hundreds of freshers heard the good news across campus — and dozens have already plugged into the fellowship.',
    body: [
      'When the Evangelism Department planned orientation week, the prayer was simple: that every fresher arriving on campus would hear the gospel before their first lecture. God answered far beyond that prayer.',
      'Over five days, teams moved through registration queues, hostel common rooms, and faculty walkways — sharing the good news, praying with students, and inviting them into the CASA UENR family. By the end of the week, more than four hundred students had heard a clear presentation of the gospel.',
      'The most encouraging sign was not the number of conversations, but the number of connections. Dozens of freshers joined our first Bible study of the semester the very same week, and the welcome desk has been busy ever since.',
      'To every volunteer who gave their evenings, and to every student who stopped to listen — thank you. The harvest is plentiful, and the labourers are rising.',
    ],
    quote: {
      text: 'Declare his glory among the nations, his marvelous deeds among all peoples.',
      cite: 'Psalm 96:3',
    },
    image:
      'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1000&h=520&fit=crop',
    meta: 'Evangelism Department · Sep 12',
  },
  {
    slug: 'healed-during-the-friday-prayer-meeting',
    kind: 'Testimony',
    title: 'Healed during the Friday prayer meeting',
    excerpt:
      'A final-year student shares how God completely healed her during the Prayer Force vigil.',
    body: [
      'What began as an ordinary Friday prayer meeting became a night the house will not forget. A final-year student, who had been managing a painful condition for months, was prayed for during the vigil — and testified the following week that she had been completely healed.',
      'In her own words: "I came to the meeting believing God for my healing, and I left without the pain. I have slept through the night every day since. All I can say is that Jesus still heals."',
      'The house rejoices with her and gives God the glory. Her testimony has stirred fresh faith across every department — and the Prayer Force has seen its largest attendance since the semester began.',
      'If you need someone to stand with you in prayer, the Prayer Force meets every Friday at 6:00 PM in the Chapel Annex. You do not have to carry it alone.',
    ],
    quote: {
      text: 'And the prayer offered in faith will make the sick well; the Lord will raise them up.',
      cite: 'James 5:15',
    },
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&h=520&fit=crop',
    meta: 'Prayer Force · Sep 5',
  },
  {
    slug: 'freshers-registration-is-open',
    kind: 'Announcement',
    title: "Freshers' registration is open",
    excerpt:
      'New on campus? Register at the welcome desk after any gathering — we would love to meet you.',
    body: [
      'A new session has begun, and if you are just arriving on campus, the CASA UENR family wants to meet you. Registration for freshers is now open at the welcome desk after every gathering.',
      'Registering helps us plug you in quickly — into a department where your gifts can grow, a Bible study group close to your hostel, and a community that will stand with you through the session.',
      'You can also reach out to any of our executives directly, or send us a message through the contact page. Whichever way feels easiest — just do not stay a stranger.',
      'Welcome to campus. Welcome home.',
    ],
    image:
      'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1000&h=520&fit=crop',
    meta: 'Executive Council · Sep 1',
  },
  {
    slug: 'departmental-meetings-resume',
    kind: 'Announcement',
    title: 'Departmental meetings resume',
    excerpt:
      'All six departments resume weekly meetings this week — check the notice board for your new time and venue.',
    body: [
      'All six departments resume their weekly meetings this week. Choir, Prayer Force, Evangelism, Media & Tech, Welfare, and Ushering & Protocol each have a refreshed schedule for the new session.',
      'Coordinators have posted the new times and venues on the Chapel Annex notice board. If you have not yet joined a department, it is not too late — visit the join page, pick where you fit, and speak to any coordinator after a gathering.',
      'Every member is a minister. This session, find your place of service and put your gift to work in the house of God.',
    ],
    image:
      'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1000&h=520&fit=crop',
    meta: 'Executive Council · Aug 30',
  },
];

export function getArticleBySlug(slug: string): SiteArticle | undefined {
  return SITE_ARTICLES.find((article) => article.slug === slug);
}

export function getRelatedArticles(slug: string, limit = 3): SiteArticle[] {
  return SITE_ARTICLES.filter((article) => article.slug !== slug).slice(0, limit);
}
