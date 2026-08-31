import { getSiteSettings } from '@/app/lib/queries/siteSettings';
import FooterClient from './FooterClient';

// Navigation structure with existing routes
const navigationGroups = [
  {
    title: 'NAVIGATION',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Matches', href: '/matches' },
      { label: 'News', href: '/news' },
      { label: 'Rankings', href: '/leaderboards' },
    ],
  },
  {
    title: 'CLUB',
    links: [
      { label: 'Players', href: '/players' },
      { label: 'Achievements', href: '/achievements' },
      { label: 'Tournaments', href: '/tournaments' },
      { label: 'Ballon d\'Or', href: '/ballon-dor' },
    ],
  },
  {
    title: 'CONNECT',
    links: [
      { label: 'Discord', href: '#', icon: 'discord', external: true },
      { label: 'YouTube', href: '#', icon: 'youtube', external: true },
      { label: 'Share', href: '#', icon: 'share', external: true },
    ],
  },
];

export default async function Footer() {
  const { logoUrl } = await getSiteSettings();

  return <FooterClient logoUrl={logoUrl} navigationGroups={navigationGroups} />;
}