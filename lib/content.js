// All the words and pictures on the home, about and gallery pages live here.
// Edit this file (on GitHub: open it, click the pencil icon, change text, Commit) and the site updates.
// Written as { en: ... } so a Hungarian version ({ hu: ... }) can be added next to it later.

export const copy = {
  en: {
    home: {
      headline: 'Community sauna in Budapest.',
      sub: 'Book a session online. Members pay less. Cancel for a full refund up to 24 hours before.',
      steps: [
        ['Book', 'Pick a session and pay online. Your places are held while you pay.'],
        ['Sauna', 'Come along, meet people, and warm up together.'],
        ['Changed plans?', 'Cancel up to 24 hours before for a full automatic refund.'],
      ],
      member: {
        title: 'Members pay 3 000 Ft instead of 4 000 Ft.',
        text: 'Membership is 5 000 Ft a year, and it is how the community looks after itself.',
      },
    },
    about: {
      title: 'About Pelikan Szauna',
      // DRAFT TEXT: replace with your own words.
      paragraphs: [
        'Pelikan Szauna is a community sauna in Budapest, run as a non-profit association (egyesület).',
        'We open the sauna in short sessions so that people can come, share the heat and meet each other. Anyone can book a place. Members pay a lower price and help shape what we do.',
        'Pelikan Szauna is an independent, volunteer-run project. Questions or ideas? Write to us on Instagram.',
      ],
    },
    gallery: {
      title: 'Gallery',
      empty: 'Photos coming soon.',
      // To add a picture: upload the file into the folder  public/gallery  on GitHub,
      // then add a line below, e.g.
      //   { src: '/gallery/trailer.jpg', alt: 'The sauna trailer at dusk', caption: 'Optional caption' },
      images: [],
    },
  },
};
