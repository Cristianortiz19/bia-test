import type { ReactNode, SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
});
const make = (d: ReactNode) => ({ size, ...p }: P) => <svg {...base(size)} {...p}>{d}</svg>;

export const IconHome = make(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>);
export const IconPulse = make(<path d="M3 12h4l3-8 4 16 3-8h4" />);
export const IconLayers = make(<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>);
export const IconBuilding = make(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" /></>);
export const IconCalendar = make(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>);
export const IconChart = make(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>);
export const IconUsers = make(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5c1.5.7 2.6 2.4 3 5.5" /></>);
export const IconSettings = make(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>);
export const IconSearch = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const IconDownload = make(<><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></>);
export const IconX = make(<path d="M6 6l12 12M18 6 6 18" />);
export const IconCheck = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const IconCheckCircle = make(<><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16.5 9.5" /></>);
export const IconArrowRight = make(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IconArrowUpRight = make(<path d="M7 17 17 7M8 7h9v9" />);
export const IconChevronDown = make(<path d="m6 9 6 6 6-6" />);
export const IconChevronRight = make(<path d="m9 6 6 6-6 6" />);
export const IconChevronLeft = make(<path d="m15 6-6 6 6 6" />);
export const IconSparkle = make(<path d="M12 3c.4 3.9 2.1 5.6 6 6-3.9.4-5.6 2.1-6 6-.4-3.9-2.1-5.6-6-6 3.9-.4 5.6-2.1 6-6ZM19 15c.2 1.7.9 2.4 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.1 2.3-.8 2.5-2.5Z" />);
export const IconFilter = make(<path d="M4 5h16l-6 7.5V19l-4 1.5v-8L4 5Z" />);
export const IconAlert = make(<><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" /></>);
export const IconRefresh = make(<><path d="M20 11a8 8 0 0 0-14.6-4.5L4 8" /><path d="M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16" /><path d="M20 20v-4h-4" /></>);
export const IconInbox = make(<><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5.5 5h13L21 13v6H3v-6l2.5-8Z" /></>);
export const IconPhone = make(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />);
export const IconMail = make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>);
export const IconClock = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const IconBolt = make(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />);
export const IconMoon = make(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />);
export const IconCoffee = make(<><path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V9Z" /><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3" /></>);
export const IconMenu = make(<path d="M4 7h16M4 12h16M4 17h16" />);
export const IconSort = make(<path d="M8 4v16M4 8l4-4 4 4M16 20V4M20 16l-4 4-4-4" />);
export const IconBell = make(<><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>);
export const IconFlask = make(<><path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3" /><path d="M7 15h10" /></>);
export const IconTarget = make(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>);
export const IconSnow = make(<path d="M12 2v20M4.9 6l14.2 12M19.1 6 4.9 18M9 4l3 2 3-2M9 20l3-2 3 2" />);
export const IconWind = make(<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8" />);
