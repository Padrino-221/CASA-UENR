export type CmsFieldType = 'text' | 'textarea' | 'image' | 'tags' | 'list';

export interface CmsListSubField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image';
  placeholder?: string;
}

export interface CmsField {
  key: string;
  label: string;
  type: CmsFieldType;
  placeholder?: string;
  help?: string;
  default?: string;
  defaultTags?: string[];
  defaultList?: Record<string, string>[];
  subFields?: CmsListSubField[];
  itemLabelKey?: string;
}

export interface CmsSection {
  key: string;
  label: string;
  description?: string;
  fields: CmsField[];
}

export interface CmsPage {
  slug: string;
  title: string;
  path: string;
  description?: string;
  sections: CmsSection[];
}

const IMG = {
  hero: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&h=600&fit=crop',
  about: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop',
};

export const DEFAULT_LEADERS: Record<string, string>[] = [
  { image: '', initials: 'OA', name: 'Oluwaseun Adeyemi', role: 'President', bio: "Coordinates the fellowship's vision and chairs the executive council.", color: 'brand' },
  { image: '', initials: 'CB', name: 'Chiamaka Balogun', role: 'Vice President', bio: 'Oversees welfare and supports every arm of the ministry.', color: 'lime' },
  { image: '', initials: 'TE', name: 'Tunde Eze', role: 'General Secretary', bio: 'Keeps the house informed, organised, and on record.', color: 'violet' },
  { image: '', initials: 'FO', name: 'Faith Okafor', role: 'Bible Study Coordinator', bio: 'Plans and teaches our weekly study of the Word.', color: 'teal' },
];

export const CMS_PAGES: CmsPage[] = [
  {
    slug: 'global',
    title: 'Brand & Footer',
    path: '/',
    description: 'Site name and the footer that appears on every page.',
    sections: [
      {
        key: 'brand',
        label: 'Brand',
        fields: [
          { key: 'siteName', label: 'Site name', type: 'text', default: 'CASA UENR' },
        ],
      },
      {
        key: 'footer',
        label: 'Footer',
        fields: [
          {
            key: 'description',
            label: 'Footer description',
            type: 'textarea',
            default:
              'Christ Apostolic Students and Associates, University of Energy and Natural Resources (UENR) — raising students rooted in Christ, on campus and beyond.',
          },
          { key: 'copyright', label: 'Copyright line', type: 'text', default: '© 2026 CASA UENR' },
          { key: 'tagline', label: 'Tagline', type: 'text', default: 'Rooted in Christ. Raised for purpose.' },
        ],
      },
    ],
  },
  {
    slug: 'home',
    title: 'Home',
    path: '/',
    sections: [
      {
        key: 'hero',
        label: 'Hero',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', help: 'Wrap words in *asterisks* for the serif accent.', default: 'Rooted in *Christ,* raised for purpose' },
          {
            key: 'body',
            label: 'Intro paragraph',
            type: 'textarea',
            default:
              'CASA UENR is a family of students growing together in the Word, prayer, and service — right in the heart of campus.',
          },
          { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'Get to know us' },
          { key: 'ctaHref', label: 'Button link', type: 'text', default: '/about' },
        ],
      },
      {
        key: 'heroImage',
        label: 'Hero image & gatherings',
        fields: [
          { key: 'image', label: 'Hero image', type: 'image', default: IMG.hero },
          {
            key: 'gatherings',
            label: 'Weekly gatherings',
            type: 'list',
            itemLabelKey: 'name',
            subFields: [
              { key: 'name', label: 'Name', type: 'text', placeholder: 'Celebration Service' },
              { key: 'time', label: 'Time', type: 'text', placeholder: 'Sun · 8:00 AM' },
            ],
            defaultList: [
              { name: 'Celebration Service', time: 'Sun · 8:00 AM' },
              { name: 'Bible Study', time: 'Wed · 5:30 PM' },
              { name: 'Prayer Meeting', time: 'Fri · 6:00 PM' },
            ],
          },
          { key: 'venue', label: 'Venue', type: 'text', default: 'Chapel Annex, Main Campus' },
        ],
      },
      {
        key: 'verse',
        label: 'Scripture strip',
        fields: [
          { key: 'quoteText', label: 'Verse', type: 'textarea', default: 'You are the light of the world. A city set on a hill cannot be hidden.' },
          { key: 'quoteCite', label: 'Reference', type: 'text', default: 'Matthew 5:14' },
        ],
      },
      {
        key: 'aboutTeaser',
        label: 'About teaser',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'Who We Are' },
          { key: 'heading', label: 'Heading', type: 'text', default: 'Driven by *faith,* built for campus life' },
          { key: 'image', label: 'Image', type: 'image', default: IMG.about },
          { key: 'tags', label: 'Tags', type: 'tags', defaultTags: ['Student-led', 'Word-centered', 'Spirit-filled', 'Campus Outreach'] },
          { key: 'heading2', label: 'Sub-heading', type: 'text', default: 'With Christ at our core, we raise students who *shine* in the classroom, the fellowship hall, and the world.' },
          {
            key: 'body',
            label: 'Paragraph',
            type: 'textarea',
            default:
              'CASA UENR — the Christ Apostolic Students and Associates fellowship at the University of Energy and Natural Resources — is a community where students encounter God, discover purpose, and build friendships that last far beyond graduation.',
          },
          { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'Read our story' },
          { key: 'ctaHref', label: 'Button link', type: 'text', default: '/about' },
          { key: 'linkLabel', label: 'Secondary link label', type: 'text', default: 'Meet the leaders' },
        ],
      },
      {
        key: 'departmentsTeaser',
        label: 'Departments teaser',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'Departments' },
          { key: 'heading', label: 'Heading', type: 'text', default: 'Serve with your *gifts*' },
          { key: 'linkLabel', label: 'Link label', type: 'text', default: 'All six departments' },
          {
            key: 'items',
            label: 'Cards',
            type: 'list',
            itemLabelKey: 'name',
            subFields: [
              { key: 'name', label: 'Name', type: 'text' },
              { key: 'text', label: 'Text', type: 'textarea' },
              { key: 'linkLabel', label: 'Link label', type: 'text' },
              { key: 'icon', label: 'Icon', type: 'text', placeholder: 'MusicNotes / HandsPraying / Lightning' },
            ],
            defaultList: [
              { name: 'Choir & Music', text: "Leading the house into God's presence with psalms, hymns, and spiritual songs.", linkLabel: 'Join the choir', icon: 'MusicNotes' },
              { name: 'Prayer Force', text: 'Fueling the fellowship with intercession for campus, nation, and one another.', linkLabel: 'Stand in the gap', icon: 'HandsPraying' },
              { name: 'Evangelism', text: 'Taking the gospel across campus — hostels, faculties, and the marketplace.', linkLabel: 'Reach out', icon: 'Lightning' },
            ],
          },
        ],
      },
      {
        key: 'newsTeaser',
        label: 'News & events teaser',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'News & Events' },
          { key: 'heading', label: 'Heading', type: 'text', default: "What's *happening* this semester" },
          { key: 'linkLabel', label: 'Link label', type: 'text', default: 'All news & events' },
          {
            key: 'items',
            label: 'Event cards',
            type: 'list',
            itemLabelKey: 'title',
            subFields: [
              { key: 'month', label: 'Month', type: 'text' },
              { key: 'day', label: 'Day', type: 'text' },
              { key: 'kind', label: 'Kind', type: 'text' },
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'text', label: 'Text', type: 'textarea' },
              { key: 'meta', label: 'Meta', type: 'text' },
            ],
            defaultList: [
              { month: 'Sep', day: '26', kind: 'Outreach', title: 'Campus Evangelism Drive', text: 'Teams head out across hostels and faculties to share the good news and pray with students.', meta: 'Meet at Chapel Annex · 4:00 PM' },
              { month: 'Oct', day: '02', kind: 'Fellowship', title: "Freshers' Welcome Night", text: 'Worship, testimonies, and dinner to welcome the new intake into the CASA UENR family.', meta: 'Main Auditorium · 6:00 PM' },
              { month: 'Oct', day: '16', kind: 'Retreat', title: 'Annual Campus Retreat', text: 'Three days away with God — teachings, workshops, and communion at the mountain.', meta: 'C.A.C. Camp Ground · Oct 16–18' },
            ],
          },
        ],
      },
      {
        key: 'cta',
        label: 'Closing call-to-action',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: "There's a place for *you* here" },
          { key: 'body', label: 'Paragraph', type: 'textarea',             default: "Whether you're a fresher finding your feet or a final year student finishing strong — CASA UENR is home." },
          { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'Find your department' },
          { key: 'ctaHref', label: 'Button link', type: 'text', default: '/departments' },
        ],
      },
    ],
  },
  {
    slug: 'about',
    title: 'About Us',
    path: '/about',
    sections: [
      {
        key: 'hero',
        label: 'Page hero',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'About *us*' },
          { key: 'body', label: 'Intro paragraph', type: 'textarea', default: 'Who we are, what we believe, and the people God has positioned to serve this house.' },
        ],
      },
      {
        key: 'overview',
        label: 'Overview',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'Who We Are' },
          { key: 'heading', label: 'Heading', type: 'text', default: 'Driven by *faith,* built for campus life' },
          { key: 'image', label: 'Image', type: 'image', default: IMG.about },
          { key: 'tags', label: 'Tags', type: 'tags', defaultTags: ['Student-led', 'Word-centered', 'Spirit-filled', 'Campus Outreach'] },
          { key: 'heading2', label: 'Sub-heading', type: 'text', default: 'With Christ at our core, we raise students who *shine* in the classroom, the fellowship hall, and the world.' },
          {
            key: 'body',
            label: 'Paragraphs',
            type: 'textarea',
            help: 'Separate paragraphs with a blank line.',
            default:
              'CASA UENR — the Christ Apostolic Students and Associates fellowship at the University of Energy and Natural Resources — is a community where students encounter God, discover purpose, and build friendships that last far beyond graduation.\n\nFrom Sunday celebrations to late-night prayer meetings, from evangelism on campus to care for one another through exams, we go beyond weekly meetings into a shared life of faith.\n\nOur vision is simple: every student rooted in Christ, equipped for purpose, and sent out to be light — in academics, in career, and in the world.',
          },
          { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'Find your place' },
          { key: 'ctaHref', label: 'Button link', type: 'text', default: '/departments' },
          { key: 'linkLabel', label: 'Secondary link label', type: 'text', default: 'Meet the leaders' },
        ],
      },
      {
        key: 'verse',
        label: 'Scripture strip',
        fields: [
          { key: 'quoteText', label: 'Verse', type: 'textarea', default: 'Let your light shine before others, that they may see your good deeds.' },
          { key: 'quoteCite', label: 'Reference', type: 'text', default: 'Matthew 5:16' },
        ],
      },
      {
        key: 'leadership',
        label: 'Leadership',
        description: 'The leaders shown in the carousel are managed under Content → Leaders.',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'Leadership' },
          { key: 'heading', label: 'Heading', type: 'text', default: 'Servants who *lead* the way' },
          { key: 'subheading', label: 'Sub-heading', type: 'textarea', default: 'Every officer serves a one-session term, elected by the house and accountable to the fellowship and our patrons.' },
        ],
      },
      {
        key: 'cta',
        label: 'Closing call-to-action',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'Ready to make CASA UENR *home?*' },
          { key: 'body', label: 'Paragraph', type: 'textarea', default: 'Join a department, plug into a gathering, and grow with us this session.' },
          { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'Find your department' },
          { key: 'ctaHref', label: 'Button link', type: 'text', default: '/departments' },
        ],
      },
    ],
  },
  {
    slug: 'departments',
    title: 'Departments',
    path: '/departments',
    sections: [
      {
        key: 'hero',
        label: 'Page hero',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'Serve with your *gifts*' },
          { key: 'body', label: 'Intro paragraph', type: 'textarea', default: 'Every member belongs somewhere. Find your department and put your gifts to work on campus.' },
        ],
      },
      {
        key: 'grid',
        label: 'Departments grid',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'The Six Arms' },
          { key: 'heading', label: 'Heading', type: 'text', default: 'Find where you *fit*' },
          { key: 'subheading', label: 'Sub-heading', type: 'textarea', default: 'Each department meets weekly and serves at every major gathering of the fellowship.' },
          {
            key: 'items',
            label: 'Departments',
            type: 'list',
            itemLabelKey: 'name',
            subFields: [
              { key: 'name', label: 'Name', type: 'text' },
              { key: 'text', label: 'Text', type: 'textarea' },
              { key: 'linkLabel', label: 'Link label', type: 'text' },
              { key: 'icon', label: 'Icon', type: 'text', placeholder: 'MusicNotes / HandsPraying / Lightning / Article / Heart / HandWaving' },
            ],
            defaultList: [
              { name: 'Choir & Music', text: "Leading the house into God's presence with psalms, hymns, and spiritual songs. Vocalists and instrumentalists welcome.", linkLabel: 'Join the choir', icon: 'MusicNotes' },
              { name: 'Prayer Force', text: 'Fueling the fellowship with intercession for campus, nation, and one another. Weekly overnight watches each semester.', linkLabel: 'Stand in the gap', icon: 'HandsPraying' },
              { name: 'Evangelism', text: 'Taking the gospel across campus — hostels, faculties, and the marketplace. Outreaches run every fortnight.', linkLabel: 'Reach out', icon: 'Lightning' },
              { name: 'Media & Tech', text: 'Sound, visuals, livestream, and social media — telling the story of what God is doing in our midst.', linkLabel: 'Create with us', icon: 'Article' },
              { name: 'Welfare', text: 'Caring for members through exams, needs, and every season of student life — visits, packages, and practical help.', linkLabel: 'Care for the house', icon: 'Heart' },
              { name: 'Ushering & Protocol', text: 'Order, welcome, and warmth at every gathering — the first smile of the house to every guest and member.', linkLabel: 'Welcome people home', icon: 'HandWaving' },
            ],
          },
        ],
      },
      {
        key: 'steps',
        label: 'How to join',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'Getting Started' },
          { key: 'heading', label: 'Heading', type: 'text', default: 'Joining is *easy*' },
          { key: 'subheading', label: 'Sub-heading', type: 'textarea', default: "Three simple steps and you're serving — no experience needed for any department." },
          {
            key: 'items',
            label: 'Steps',
            type: 'list',
            itemLabelKey: 'title',
            subFields: [
              { key: 'number', label: 'Number', type: 'text' },
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'text', label: 'Text', type: 'textarea' },
            ],
            defaultList: [
              { number: '1', title: 'Pick a department', text: 'Explore the six arms above and choose where your gifts and interests align. You can always switch later.' },
              { number: '2', title: 'Meet the coordinator', text: 'Reach out after any gathering or through the welcome desk. Every department head will walk you through onboarding.' },
              { number: '3', title: 'Start serving', text: 'Join the next departmental meeting, get your onboarding pack, and take your place in the house.' },
            ],
          },
        ],
      },
      {
        key: 'cta',
        label: 'Closing call-to-action',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'Still deciding? *Visit first.*' },
          { key: 'body', label: 'Paragraph', type: 'textarea', default: 'Worship with us any Sunday at 8:00 AM and see where you fit — no pressure, all welcome.' },
          { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'See upcoming events' },
          { key: 'ctaHref', label: 'Button link', type: 'text', default: '/news' },
        ],
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    path: '/contact',
    sections: [
      {
        key: 'hero',
        label: 'Page hero',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'Get in *touch*' },
          { key: 'body', label: 'Intro paragraph', type: 'textarea', default: "Questions, prayer requests, or just want to say hello — we'd love to hear from you." },
        ],
      },
      {
        key: 'form',
        label: 'Message form',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'Send us a *message*' },
          { key: 'note', label: 'Note', type: 'text', default: 'We usually reply within a day or two. Your details stay with us.' },
        ],
      },
      {
        key: 'info',
        label: 'Contact details',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'Reach us *directly*' },
          { key: 'subheading', label: 'Sub-heading', type: 'text', default: 'Faster than a form — reach out however suits you best.' },
          { key: 'address', label: 'Address', type: 'textarea', help: 'One line per row.', default: 'Chapel Annex, Main Campus\nUniversity of Energy and Natural Resources, Sunyani' },
          { key: 'gatherings', label: 'Worship gatherings', type: 'textarea', help: 'One line per row.', default: 'Sundays · 8:00 AM\nWednesdays · 5:30 PM\nFridays · 6:00 PM' },
          { key: 'email', label: 'Email', type: 'text', default: 'hello@casauenr.org' },
          { key: 'phone', label: 'Phone / WhatsApp', type: 'text', default: '+233 20 000 0000' },
        ],
      },
      {
        key: 'socials',
        label: 'Social links',
        fields: [
          { key: 'instagram', label: 'Instagram URL', type: 'text', default: '#' },
          { key: 'whatsapp', label: 'WhatsApp URL', type: 'text', default: '#' },
          { key: 'twitter', label: 'X (Twitter) URL', type: 'text', default: '#' },
          { key: 'youtube', label: 'YouTube URL', type: 'text', default: '#' },
        ],
      },
      {
        key: 'cta',
        label: 'Closing call-to-action',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'The best way to reach us? *In person.*' },
          { key: 'body', label: 'Paragraph', type: 'textarea', default: 'Worship with us this Sunday at 8:00 AM, Chapel Annex, Main Campus — the welcome desk is right inside.' },
          { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'See upcoming events' },
          { key: 'ctaHref', label: 'Button link', type: 'text', default: '/news' },
        ],
      },
    ],
  },
  {
    slug: 'news',
    title: 'News & Events',
    path: '/news',
    description: 'Page headings. Individual articles and events are managed under News and Events.',
    sections: [
      {
        key: 'hero',
        label: 'Page hero',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: 'News & *events*' },
          { key: 'body', label: 'Intro paragraph', type: 'textarea', default: "What's happening in the house this semester — mark your calendar and bring a friend." },
        ],
      },
      {
        key: 'eventsHead',
        label: 'Upcoming events heading',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'Upcoming' },
          { key: 'heading', label: 'Heading', type: 'text', default: "This *semester's* calendar" },
          { key: 'subheading', label: 'Sub-heading', type: 'textarea', default: 'Every gathering is open to every student — no registration needed.' },
        ],
      },
      {
        key: 'announcementsHead',
        label: 'Announcements heading',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'Announcements' },
          { key: 'heading', label: 'Heading', type: 'text', default: 'From the *pulpit*' },
          { key: 'subheading', label: 'Sub-heading', type: 'textarea', default: 'Notices from the executive council and department heads.' },
        ],
      },
      {
        key: 'latestHead',
        label: 'Latest news heading',
        fields: [
          { key: 'badge', label: 'Badge', type: 'text', default: 'Latest News' },
          { key: 'heading', label: 'Heading', type: 'text', default: 'Stories from the *house*' },
          { key: 'subheading', label: 'Sub-heading', type: 'textarea', default: 'Recaps and testimonies from recent gatherings and outreaches.' },
        ],
      },
      {
        key: 'cta',
        label: 'Closing call-to-action',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text', default: "Don't just read about it — *be there.*" },
          { key: 'body', label: 'Paragraph', type: 'textarea', default: 'Worship with us this Sunday at 8:00 AM, Chapel Annex, Main Campus.' },
          { key: 'ctaLabel', label: 'Button label', type: 'text', default: 'Find your department' },
          { key: 'ctaHref', label: 'Button link', type: 'text', default: '/departments' },
        ],
      },
    ],
  },
];

export function getCmsPage(slug: string): CmsPage | undefined {
  return CMS_PAGES.find((page) => page.slug === slug);
}

export function fieldDefaultString(field: CmsField): string {
  if (field.type === 'tags') return JSON.stringify(field.defaultTags ?? []);
  if (field.type === 'list') return JSON.stringify(field.defaultList ?? []);
  return field.default ?? '';
}

export function defaultContentForPage(page: CmsPage): Record<string, string> {
  const out: Record<string, string> = {};
  for (const section of page.sections) {
    for (const field of section.fields) {
      out[`${section.key}.${field.key}`] = fieldDefaultString(field);
    }
  }
  return out;
}

export function allDefaultContent(): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const page of CMS_PAGES) out[page.slug] = defaultContentForPage(page);
  return out;
}
