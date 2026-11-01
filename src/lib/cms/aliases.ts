/** Preserve content entered before the public-page composition was aligned with the editor. */
export const CMS_KEY_ALIASES: Record<string, Record<string,string>> = {
  home: {
    'welcome.image':'heroImage.image', 'welcome.imageAlt':'heroImage.imageAlt',
    'community.heading':'welcome.communityHeading', 'community.body':'welcome.communityBody',
    'community.ctaLabel':'welcome.communityCtaLabel', 'community.ctaHref':'welcome.communityCtaHref',
    'community.image':'aboutTeaser.image', 'community.imageAlt':'aboutTeaser.imageAlt',
    'next.heading':'welcome.nextHeading', 'next.body':'welcome.nextBody', 'next.items':'welcome.steps',
  },
};
