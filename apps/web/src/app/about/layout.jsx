// SEO Metadata for About Page
export const metadata = {
  title: 'About Us',
  description: 'Learn about Nexta - a culturally-grounded platform connecting First Nations job seekers with meaningful employment, education, and mentorship opportunities.',
  keywords: ['about Nexta', 'Indigenous employment platform', 'First Nations careers', 'Aboriginal job platform'],
  openGraph: {
    title: 'About Nexta',
    description: 'A culturally-grounded platform connecting First Nations job seekers with meaningful opportunities.',
    url: 'https://nexta.life/about',
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({ children }) {
  return children;
}
