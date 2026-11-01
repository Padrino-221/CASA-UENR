export type CmsFieldType = 'text' | 'textarea' | 'image' | 'tags' | 'list' | 'boolean';
export interface CmsListSubField { key: string; label: string; type: 'text' | 'textarea' | 'image'; placeholder?: string; }
export interface CmsField { key: string; label: string; type: CmsFieldType; placeholder?: string; help?: string; default?: string; defaultTags?: string[]; defaultList?: Record<string,string>[]; subFields?: CmsListSubField[]; itemLabelKey?: string; }
export interface CmsSection { key: string; label: string; description?: string; fields: CmsField[]; }
export interface CmsPage { slug: string; title: string; path: string; description?: string; sections: CmsSection[]; }

export const CMS_PAGES: CmsPage[] = [
  {
    "slug": "global",
    "title": "Brand, navigation & footer",
    "path": "/",
    "description": "Shared content displayed across the website.",
    "sections": [
      {
        "key": "brand",
        "label": "Brand",
        "fields": [
          {
            "key": "siteName",
            "label": "Site name",
            "type": "text",
            "default": "CASA UENR"
          },
          {
            "key": "subtitle",
            "label": "Header subtitle",
            "type": "text",
            "default": "A faith community at UENR"
          },
          {
            "key": "fullName",
            "label": "Full fellowship name",
            "type": "text",
            "default": "Christ Apostolic Students and Associates"
          },
          {
            "key": "logo",
            "label": "Logo",
            "type": "image",
            "default": "/casa-logo.png"
          },
          {
            "key": "description",
            "label": "Organisation description",
            "type": "textarea",
            "default": "A Christian fellowship at the University of Energy and Natural Resources, Sunyani."
          }
        ]
      },
      {
        "key": "navigation",
        "label": "Header & mobile menu",
        "fields": [
          {
            "key": "items",
            "label": "Navigation links",
            "type": "list",
            "defaultList": [
              {
                "label": "Home",
                "href": "/"
              },
              {
                "label": "About us",
                "href": "/about"
              },
              {
                "label": "Departments",
                "href": "/departments"
              },
              {
                "label": "News & events",
                "href": "/news"
              },
              {
                "label": "Contact",
                "href": "/contact"
              }
            ],
            "subFields": [
              {
                "key": "label",
                "label": "Label",
                "type": "text"
              },
              {
                "key": "href",
                "label": "Link",
                "type": "text"
              }
            ],
            "itemLabelKey": "label"
          },
          {
            "key": "ctaLabel",
            "label": "Header button label",
            "type": "text",
            "default": "Plan a visit"
          },
          {
            "key": "ctaHref",
            "label": "Header button link",
            "type": "text",
            "default": "/contact"
          },
          {
            "key": "mobileHeading",
            "label": "Mobile menu heading",
            "type": "text",
            "default": "Find your place."
          },
          {
            "key": "mobileCtaLabel",
            "label": "Mobile button label",
            "type": "text",
            "default": "Plan your first visit"
          }
        ]
      },
      {
        "key": "footer",
        "label": "Footer",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "eyebrow",
            "label": "Invitation label",
            "type": "text",
            "default": "Faith. Friendship. University life."
          },
          {
            "key": "heading",
            "label": "Invitation heading",
            "type": "text",
            "default": "There is a place for you here."
          },
          {
            "key": "ctaLabel",
            "label": "Visit button label",
            "type": "text",
            "default": "Plan your first visit"
          },
          {
            "key": "ctaHref",
            "label": "Visit button link",
            "type": "text",
            "default": "/contact"
          },
          {
            "key": "description",
            "label": "Description",
            "type": "textarea",
            "default": "Christ Apostolic Students and Associates at the University of Energy and Natural Resources. A community for worship, friendship, and growing in Christ."
          },
          {
            "key": "linksHeading",
            "label": "Links heading",
            "type": "text",
            "default": "Find your place"
          },
          {
            "key": "links",
            "label": "Footer links",
            "type": "list",
            "defaultList": [
              {
                "label": "Our story",
                "href": "/about"
              },
              {
                "label": "Meet the leadership",
                "href": "/about#leadership"
              },
              {
                "label": "Departments",
                "href": "/departments"
              },
              {
                "label": "News & gatherings",
                "href": "/news"
              },
              {
                "label": "Get in touch",
                "href": "/contact"
              }
            ],
            "subFields": [
              {
                "key": "label",
                "label": "Label",
                "type": "text"
              },
              {
                "key": "href",
                "label": "Link",
                "type": "text"
              }
            ],
            "itemLabelKey": "label"
          },
          {
            "key": "gatheringsHeading",
            "label": "Gatherings heading",
            "type": "text",
            "default": "Gather with us"
          },
          {
            "key": "copyright",
            "label": "Copyright",
            "type": "text",
            "default": "© 2026 CASA UENR"
          },
          {
            "key": "tagline",
            "label": "Tagline",
            "type": "text",
            "default": "Rooted in Christ. Raised for purpose."
          }
        ],
        "description": "The weekly schedule and venue are managed in Home → Weekly gatherings."
      }
    ]
  },
  {
    "slug": "home",
    "title": "Home",
    "path": "/",
    "sections": [
      {
        "key": "welcome",
        "label": "Welcome",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "eyebrow",
            "label": "Introductory label",
            "type": "text",
            "default": "Welcome to CASA UENR"
          },
          {
            "key": "heading",
            "label": "Main heading",
            "type": "text",
            "default": "A church family for your university journey."
          },
          {
            "key": "body",
            "label": "Introduction",
            "type": "textarea",
            "default": "Grow in faith, build lasting friendships, and find support for student life. CASA UENR brings students together to worship Jesus and live out His love on campus."
          },
          {
            "key": "ctaLabel",
            "label": "Welcome button",
            "type": "text",
            "default": "Plan your first visit"
          },
          {
            "key": "ctaHref",
            "label": "Main button link",
            "type": "text",
            "default": "/contact"
          },
          {
            "key": "secondaryLabel",
            "label": "Secondary link label",
            "type": "text",
            "default": "Get to know us"
          },
          {
            "key": "secondaryHref",
            "label": "Secondary link",
            "type": "text",
            "default": "/about"
          },
          {
            "key": "image",
            "label": "First carousel image",
            "type": "image",
            "default": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&h=600&fit=crop"
          },
          {
            "key": "imageAlt",
            "label": "First carousel image description",
            "type": "text",
            "default": "Students worshipping together at CASA UENR"
          },
          {
            "key": "slides",
            "label": "Additional carousel images",
            "type": "list",
            "help": "Add and reorder photos after the first image. The slideshow advances every five seconds and pauses on hover.",
            "defaultList": [{ "image": "/church-bg.jpg", "alt": "Our church community" }],
            "itemLabelKey": "alt",
            "subFields": [
              { "key": "image", "label": "Image", "type": "image" },
              { "key": "alt", "label": "Image description", "type": "text" }
            ]
          }
        ]
      },
      {
        "key": "heroImage",
        "label": "Weekly gatherings",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Gatherings heading",
            "type": "text",
            "default": "Join us this week"
          },
          {
            "key": "gatherings",
            "label": "Weekly gatherings",
            "type": "list",
            "itemLabelKey": "name",
            "subFields": [
              {
                "key": "name",
                "label": "Name",
                "type": "text",
                "placeholder": "Celebration Service"
              },
              {
                "key": "time",
                "label": "Time",
                "type": "text",
                "placeholder": "Sun Â· 8:00 AM"
              }
            ],
            "defaultList": [
              {
                "name": "Celebration Service",
                "time": "Sun Â· 8:00 AM"
              },
              {
                "name": "Bible Study",
                "time": "Wed Â· 5:30 PM"
              },
              {
                "name": "Prayer Meeting",
                "time": "Fri Â· 6:00 PM"
              }
            ]
          },
          {
            "key": "venue",
            "label": "Venue",
            "type": "text",
            "default": "Chapel Annex, Main Campus"
          }
        ],
        "description": "This schedule and venue also appear in the footer."
      },
      {
        "key": "community",
        "label": "Community introduction",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "eyebrow",
            "label": "Section label",
            "type": "text",
            "default": "Life together, in Christ"
          },
          {
            "key": "heading",
            "label": "Community heading",
            "type": "text",
            "default": "Faith for everyday campus life."
          },
          {
            "key": "body",
            "label": "Community introduction",
            "type": "textarea",
            "default": "University is a time of questions, change, and possibility. You do not have to navigate it alone. We make room for worship, honest conversations, prayer, and friendships that help us grow in Christ."
          },
          {
            "key": "ctaLabel",
            "label": "Community link label",
            "type": "text",
            "default": "More about our fellowship"
          },
          {
            "key": "ctaHref",
            "label": "Community link",
            "type": "text",
            "default": "/about"
          },
          {
            "key": "image",
            "label": "Image",
            "type": "image",
            "default": "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop"
          },
          {
            "key": "imageAlt",
            "label": "Image description",
            "type": "text",
            "default": "Students sharing fellowship on campus"
          }
        ]
      },
      {
        "key": "next",
        "label": "Next steps",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Next steps heading",
            "type": "text",
            "default": "There is a place for you here."
          },
          {
            "key": "body",
            "label": "Next steps introduction",
            "type": "textarea",
            "default": "Start with a gathering. Get to know the fellowship. Take your next step at your own pace."
          },
          {
            "key": "items",
            "label": "Ways to connect",
            "type": "list",
            "itemLabelKey": "title",
            "subFields": [
              {
                "key": "title",
                "label": "Title",
                "type": "text"
              },
              {
                "key": "text",
                "label": "Description",
                "type": "textarea"
              },
              {
                "key": "href",
                "label": "Link",
                "type": "text"
              },
              {
                "key": "label",
                "label": "Link label",
                "type": "text"
              }
            ],
            "defaultList": [
              {
                "title": "Worship with us",
                "text": "Join a weekly gathering for worship, Scripture, and prayer. You are welcome, even if it is your first time at church.",
                "href": "/contact",
                "label": "Find a gathering"
              },
              {
                "title": "Find your community",
                "text": "Make friends and use your gifts through music, prayer, outreach, care, media, or welcoming others.",
                "href": "/departments",
                "label": "Explore departments"
              },
              {
                "title": "Talk to someone",
                "text": "Have a question, need prayer, or want help finding your way? Reach out to the fellowship.",
                "href": "/contact#message",
                "label": "Get in touch"
              }
            ]
          }
        ]
      },
      {
        "key": "seo",
        "label": "Search & sharing",
        "fields": [
          {
            "key": "title",
            "label": "Page title",
            "type": "text",
            "default": "CASA UENR — Christ Apostolic Students and Associates at UENR"
          },
          {
            "key": "description",
            "label": "Description",
            "type": "textarea",
            "default": "A student fellowship growing in faith, friendship, and service at UENR, Sunyani."
          },
          {
            "key": "image",
            "label": "Sharing image",
            "type": "image",
            "default": "/casa-social.png"
          }
        ]
      }
    ]
  },
  {
    "slug": "about",
    "title": "About us",
    "path": "/about",
    "sections": [
      {
        "key": "hero",
        "label": "Page introduction",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "About CASA UENR"
          },
          {
            "key": "body",
            "label": "Introduction",
            "type": "textarea",
            "default": "A Christian community for university life, built around worship, friendship, and service."
          }
        ]
      },
      {
        "key": "overview",
        "label": "Our story",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "A place to grow in faith"
          },
          {
            "key": "body",
            "label": "Paragraphs",
            "type": "textarea",
            "help": "Separate paragraphs with a blank line.",
            "default": "CASA UENR â€” the Christ Apostolic Students and Associates fellowship at the University of Energy and Natural Resources â€” is a community where students encounter God, discover purpose, and build friendships that last far beyond graduation.\n\nFrom Sunday celebrations to late-night prayer meetings, from evangelism on campus to care for one another through exams, we go beyond weekly meetings into a shared life of faith.\n\nOur vision is simple: every student rooted in Christ, equipped for purpose, and sent out to be light â€” in academics, in career, and in the world."
          },
          {
            "key": "image",
            "label": "Image",
            "type": "image",
            "default": "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop"
          },
          {
            "key": "imageAlt",
            "label": "Image description",
            "type": "text",
            "default": "Members of the CASA UENR fellowship"
          },
          {
            "key": "ctaLabel",
            "label": "Button label",
            "type": "text",
            "default": "Visit the fellowship"
          },
          {
            "key": "ctaHref",
            "label": "Button link",
            "type": "text",
            "default": "/contact"
          }
        ]
      },
      {
        "key": "campus",
        "label": "Faith on campus",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "Faith lived out on campus"
          },
          {
            "key": "body",
            "label": "Introduction",
            "type": "textarea",
            "default": "Our life together continues beyond the Sunday gathering."
          },
          {
            "key": "items",
            "label": "Values",
            "type": "list",
            "defaultList": [
              {
                "title": "Learn together",
                "text": "Explore the Bible, ask questions, and build a faith that shapes your everyday decisions."
              },
              {
                "title": "Care for one another",
                "text": "Find friendship, encouragement, and prayer through the demands of university life."
              },
              {
                "title": "Serve with purpose",
                "text": "Use your gifts to support the fellowship and share the love of Christ on campus."
              }
            ],
            "subFields": [
              {
                "key": "title",
                "label": "Title",
                "type": "text"
              },
              {
                "key": "text",
                "label": "Description",
                "type": "textarea"
              }
            ],
            "itemLabelKey": "title"
          }
        ]
      },
      {
        "key": "leadership",
        "label": "Leadership carousel",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "Meet the leadership"
          },
          {
            "key": "subheading",
            "label": "Introduction",
            "type": "textarea",
            "default": "The students and associates serving our fellowship."
          },
          {
            "key": "label",
            "label": "Carousel label",
            "type": "text",
            "default": "Our leadership team"
          },
          {
            "key": "countLabel",
            "label": "Count suffix",
            "type": "text",
            "default": "leaders serving our fellowship"
          },
          {
            "key": "swipeLabel",
            "label": "Swipe instruction",
            "type": "text",
            "default": "Swipe to explore"
          }
        ],
        "description": "Add, edit, reorder, and unpublish portraits in Website CMS → Leaders."
      },
      {
        "key": "seo",
        "label": "Search & sharing",
        "fields": [
          {
            "key": "title",
            "label": "Page title",
            "type": "text",
            "default": "About us"
          },
          {
            "key": "description",
            "label": "Description",
            "type": "textarea",
            "default": "Meet the CASA UENR fellowship and the students serving our church community."
          },
          {
            "key": "image",
            "label": "Sharing image",
            "type": "image",
            "default": "/casa-social.png"
          }
        ]
      }
    ]
  },
  {
    "slug": "departments",
    "title": "Departments",
    "path": "/departments",
    "sections": [
      {
        "key": "hero",
        "label": "Page introduction",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "Find a place to serve"
          },
          {
            "key": "body",
            "label": "Introduction",
            "type": "textarea",
            "default": "Bring your interests, learn something new, and help make fellowship life possible."
          }
        ]
      },
      {
        "key": "grid",
        "label": "Department cards",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "items",
            "label": "Departments",
            "type": "list",
            "itemLabelKey": "name",
            "subFields": [
              {
                "key": "name",
                "label": "Name",
                "type": "text"
              },
              {
                "key": "text",
                "label": "Text",
                "type": "textarea"
              },
              {
                "key": "icon",
                "label": "Icon",
                "type": "text",
                "placeholder": "MusicNotes / HandsPraying / Lightning / Article / Heart / HandWaving"
              }
            ],
            "defaultList": [
              {
                "name": "Choir & Music",
                "text": "Leading the house into God's presence with psalms, hymns, and spiritual songs. Vocalists and instrumentalists welcome.",
                "linkLabel": "Join the choir",
                "icon": "MusicNotes"
              },
              {
                "name": "Prayer Force",
                "text": "Fueling the fellowship with intercession for campus, nation, and one another. Weekly overnight watches each semester.",
                "linkLabel": "Stand in the gap",
                "icon": "HandsPraying"
              },
              {
                "name": "Evangelism",
                "text": "Taking the gospel across campus â€” hostels, faculties, and the marketplace. Outreaches run every fortnight.",
                "linkLabel": "Reach out",
                "icon": "Lightning"
              },
              {
                "name": "Media & Tech",
                "text": "Sound, visuals, livestream, and social media â€” telling the story of what God is doing in our midst.",
                "linkLabel": "Create with us",
                "icon": "Article"
              },
              {
                "name": "Welfare",
                "text": "Caring for members through exams, needs, and every season of student life â€” visits, packages, and practical help.",
                "linkLabel": "Care for the house",
                "icon": "Heart"
              },
              {
                "name": "Ushering & Protocol",
                "text": "Order, welcome, and warmth at every gathering â€” the first smile of the house to every guest and member.",
                "linkLabel": "Welcome people home",
                "icon": "HandWaving"
              }
            ]
          }
        ]
      },
      {
        "key": "steps",
        "label": "Getting involved",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "Getting involved is simple"
          },
          {
            "key": "subheading",
            "label": "Introduction",
            "type": "textarea",
            "default": "You do not need to have everything figured out. Come to a gathering, meet the team, and find where you feel at home."
          },
          {
            "key": "ctaLabel",
            "label": "Button label",
            "type": "text",
            "default": "Talk to the team"
          },
          {
            "key": "ctaHref",
            "label": "Button link",
            "type": "text",
            "default": "/contact"
          },
          {
            "key": "items",
            "label": "Steps",
            "type": "list",
            "itemLabelKey": "title",
            "subFields": [
              {
                "key": "number",
                "label": "Number",
                "type": "text"
              },
              {
                "key": "title",
                "label": "Title",
                "type": "text"
              },
              {
                "key": "text",
                "label": "Text",
                "type": "textarea"
              }
            ],
            "defaultList": [
              {
                "number": "1",
                "title": "Pick a department",
                "text": "Explore the six arms above and choose where your gifts and interests align. You can always switch later."
              },
              {
                "number": "2",
                "title": "Meet the coordinator",
                "text": "Reach out after any gathering or through the welcome desk. Every department head will walk you through onboarding."
              },
              {
                "number": "3",
                "title": "Start serving",
                "text": "Join the next departmental meeting, get your onboarding pack, and take your place in the house."
              }
            ]
          }
        ]
      },
      {
        "key": "seo",
        "label": "Search & sharing",
        "fields": [
          {
            "key": "title",
            "label": "Page title",
            "type": "text",
            "default": "Departments"
          },
          {
            "key": "description",
            "label": "Description",
            "type": "textarea",
            "default": "Find your place to serve in the CASA UENR fellowship."
          },
          {
            "key": "image",
            "label": "Sharing image",
            "type": "image",
            "default": "/casa-social.png"
          }
        ]
      }
    ]
  },
  {
    "slug": "contact",
    "title": "Contact",
    "path": "/contact",
    "sections": [
      {
        "key": "hero",
        "label": "Page introduction",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "We would love to meet you"
          },
          {
            "key": "body",
            "label": "Introduction",
            "type": "textarea",
            "default": "Planning your first visit, looking for a department, or need someone to pray with? Get in touch with the fellowship."
          }
        ]
      },
      {
        "key": "info",
        "label": "Contact details",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "Talk to the team"
          },
          {
            "key": "subheading",
            "label": "Introduction",
            "type": "textarea",
            "default": "You are welcome to come to a gathering and introduce yourself. If you would like help finding us, send a message before you visit."
          },
          {
            "key": "addressLabel",
            "label": "Address heading",
            "type": "text",
            "default": "Find us on campus"
          },
          {
            "key": "address",
            "label": "Address",
            "type": "textarea",
            "help": "One line per row.",
            "default": "Chapel Annex, Main Campus\nUniversity of Energy and Natural Resources, Sunyani"
          },
          {
            "key": "emailLabel",
            "label": "Email heading",
            "type": "text",
            "default": "Email"
          },
          {
            "key": "email",
            "label": "Email",
            "type": "text",
            "default": "hello@casauenr.org"
          },
          {
            "key": "phoneLabel",
            "label": "Phone heading",
            "type": "text",
            "default": "Phone"
          },
          {
            "key": "phone",
            "label": "Phone / WhatsApp",
            "type": "text",
            "default": "+233 20 000 0000"
          }
        ]
      },
      {
        "key": "form",
        "label": "Message form",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "Send a message"
          },
          {
            "key": "nameLabel",
            "label": "Name label",
            "type": "text",
            "default": "Your name"
          },
          {
            "key": "emailLabel",
            "label": "Email label",
            "type": "text",
            "default": "Email address"
          },
          {
            "key": "topicLabel",
            "label": "Topic label",
            "type": "text",
            "default": "How can we help?"
          },
          {
            "key": "topics",
            "label": "Topics",
            "type": "list",
            "defaultList": [
              {
                "label": "Planning a first visit"
              },
              {
                "label": "Joining a department"
              },
              {
                "label": "Prayer or pastoral support"
              },
              {
                "label": "Something else"
              }
            ],
            "subFields": [
              {
                "key": "label",
                "label": "Topic",
                "type": "text"
              }
            ],
            "itemLabelKey": "label"
          },
          {
            "key": "messageLabel",
            "label": "Message label",
            "type": "text",
            "default": "Your message"
          },
          {
            "key": "buttonLabel",
            "label": "Submit button",
            "type": "text",
            "default": "Send message"
          },
          {
            "key": "sendingLabel",
            "label": "Sending button",
            "type": "text",
            "default": "Sending..."
          },
          {
            "key": "note",
            "label": "Form note",
            "type": "text",
            "default": "Your message goes directly to the chapter secretary."
          },
          {
            "key": "success",
            "label": "Success message",
            "type": "textarea",
            "default": "Message received. The secretary will contact you using the email address you provided."
          }
        ]
      },
      {
        "key": "socials",
        "label": "Social links",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "Connect with us"
          },
          {
            "key": "instagram",
            "label": "Instagram URL",
            "type": "text",
            "default": "#"
          },
          {
            "key": "whatsapp",
            "label": "WhatsApp URL",
            "type": "text",
            "default": "#"
          },
          {
            "key": "twitter",
            "label": "X (Twitter) URL",
            "type": "text",
            "default": "#"
          },
          {
            "key": "youtube",
            "label": "YouTube URL",
            "type": "text",
            "default": "#"
          }
        ]
      },
      {
        "key": "seo",
        "label": "Search & sharing",
        "fields": [
          {
            "key": "title",
            "label": "Page title",
            "type": "text",
            "default": "Contact"
          },
          {
            "key": "description",
            "label": "Description",
            "type": "textarea",
            "default": "Contact CASA UENR, send a message, or plan your first visit."
          },
          {
            "key": "image",
            "label": "Sharing image",
            "type": "image",
            "default": "/casa-social.png"
          }
        ]
      }
    ]
  },
  {
    "slug": "news",
    "title": "News & gatherings",
    "path": "/news",
    "description": "Page headings and article-page labels. Manage individual articles and gatherings in News & Articles and Upcoming Events.",
    "sections": [
      {
        "key": "hero",
        "label": "Page introduction",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "News & gatherings"
          },
          {
            "key": "body",
            "label": "Introduction",
            "type": "textarea",
            "default": "What is happening in the fellowship, and stories from our life together."
          }
        ]
      },
      {
        "key": "eventsHead",
        "label": "Gatherings",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "Fellowship calendar"
          },
          {
            "key": "subheading",
            "label": "Introduction",
            "type": "textarea",
            "default": "Contact the team to confirm details before attending a special event."
          }
        ]
      },
      {
        "key": "latestHead",
        "label": "Articles",
        "fields": [
          {
            "key": "enabled",
            "label": "Show this section",
            "type": "boolean",
            "default": "true"
          },
          {
            "key": "heading",
            "label": "Heading",
            "type": "text",
            "default": "From the fellowship"
          },
          {
            "key": "subheading",
            "label": "Introduction",
            "type": "textarea",
            "default": ""
          },
          {
            "key": "readLabel",
            "label": "Read link label",
            "type": "text",
            "default": "Read more"
          }
        ]
      },
      {
        "key": "article",
        "label": "Article detail pages",
        "fields": [
          {
            "key": "backLabel",
            "label": "Back link label",
            "type": "text",
            "default": "All news & gatherings"
          },
          {
            "key": "relatedHeading",
            "label": "Related articles heading",
            "type": "text",
            "default": "More from the fellowship"
          },
          {
            "key": "relatedEnabled",
            "label": "Show related articles",
            "type": "boolean",
            "default": "true"
          }
        ]
      },
      {
        "key": "seo",
        "label": "Search & sharing",
        "fields": [
          {
            "key": "title",
            "label": "Page title",
            "type": "text",
            "default": "News & gatherings"
          },
          {
            "key": "description",
            "label": "Description",
            "type": "textarea",
            "default": "News, articles, announcements, and upcoming gatherings from CASA UENR."
          },
          {
            "key": "image",
            "label": "Sharing image",
            "type": "image",
            "default": "/casa-social.png"
          }
        ]
      }
    ]
  }
];

export function getCmsPage(slug:string):CmsPage|undefined { return CMS_PAGES.find(page=>page.slug===slug); }
export function fieldDefaultString(field:CmsField):string { if(field.type==='tags')return JSON.stringify(field.defaultTags??[]);if(field.type==='list')return JSON.stringify(field.defaultList??[]);return field.default??''; }
export function defaultContentForPage(page:CmsPage):Record<string,string> { return Object.fromEntries(page.sections.flatMap(section=>section.fields.map(field=>[`${section.key}.${field.key}`,fieldDefaultString(field)]))); }
export function allDefaultContent():Record<string,Record<string,string>> { return Object.fromEntries(CMS_PAGES.map(page=>[page.slug,defaultContentForPage(page)])); }
