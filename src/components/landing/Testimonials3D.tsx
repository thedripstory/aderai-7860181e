import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Marquee } from '@/components/ui/3d-testimonials';
import { ScrollReveal } from '@/components/ScrollReveal';

const testimonials = [
  {
    name: 'Rachel Chen',
    username: '@rachelchen',
    body: 'Deployed 70 segments in under a minute. Our email revenue jumped 35% in the first month!',
    img: 'https://randomuser.me/api/portraits/women/32.jpg',
    country: '🇺🇸 USA',
  },
  {
    name: 'Marcus Johnson',
    username: '@marcusj',
    body: 'What used to take our team 2 weeks now takes 30 seconds. Absolute game changer.',
    img: 'https://randomuser.me/api/portraits/men/51.jpg',
    country: '🇬🇧 UK',
  },
  {
    name: 'Sophie Laurent',
    username: '@sophiel',
    body: 'The AI suggestions are scary accurate. Found customer segments we never knew existed.',
    img: 'https://randomuser.me/api/portraits/women/68.jpg',
    country: '🇫🇷 France',
  },
  {
    name: 'David Kim',
    username: '@davidkim',
    body: 'Finally, enterprise-level segmentation without the enterprise price tag. 100% free!',
    img: 'https://randomuser.me/api/portraits/men/33.jpg',
    country: '🇰🇷 Korea',
  },
  {
    name: 'Emma Rodriguez',
    username: '@emmar',
    body: 'Our Klaviyo workflows are so much cleaner now. The segment organization is beautiful.',
    img: 'https://randomuser.me/api/portraits/women/45.jpg',
    country: '🇪🇸 Spain',
  },
  {
    name: 'James Wilson',
    username: '@jamesw',
    body: 'Switched from manual segmentation and never looked back. This is how it should be done.',
    img: 'https://randomuser.me/api/portraits/men/22.jpg',
    country: '🇦🇺 Australia',
  },
  {
    name: 'Priya Sharma',
    username: '@priyas',
    body: 'The one-click deploy to Klaviyo is magic. All 70 segments created instantly!',
    img: 'https://randomuser.me/api/portraits/women/53.jpg',
    country: '🇮🇳 India',
  },
  {
    name: 'Tom Anderson',
    username: '@tomand',
    body: 'Our abandoned cart recovery improved 40% with the browse abandoner segments.',
    img: 'https://randomuser.me/api/portraits/men/61.jpg',
    country: '🇨🇦 Canada',
  },
  {
    name: 'Lisa Park',
    username: '@lisap',
    body: 'VIP reactivation segment alone paid for itself... oh wait, it\'s free! Amazing tool.',
    img: 'https://randomuser.me/api/portraits/women/79.jpg',
    country: '🇯🇵 Japan',
  },
  {
    name: 'Alex Martinez',
    username: '@alexm',
    body: 'Best Klaviyo tool I\'ve ever used. Setup took literally 2 minutes.',
    img: 'https://randomuser.me/api/portraits/men/44.jpg',
    country: '🇲🇽 Mexico',
  },
  {
    name: 'Nina Petrov',
    username: '@ninap',
    body: 'The segment bundles are genius. Saved us weeks of planning and execution.',
    img: 'https://randomuser.me/api/portraits/women/29.jpg',
    country: '🇷🇺 Russia',
  },
  {
    name: 'Chris Taylor',
    username: '@christ',
    body: 'Our open rates increased 28% after implementing Aderai segments. Incredible results.',
    img: 'https://randomuser.me/api/portraits/men/76.jpg',
    country: '🇳🇿 New Zealand',
  },
  {
    name: 'Maria Santos',
    username: '@marias',
    body: 'Finally found a tool that understands Klaviyo. The integration is seamless.',
    img: 'https://randomuser.me/api/portraits/women/63.jpg',
    country: '🇧🇷 Brazil',
  },
  {
    name: 'Henrik Berg',
    username: '@henrikb',
    body: 'We went from 5 segments to 70 in one afternoon. Mind-blowing efficiency.',
    img: 'https://randomuser.me/api/portraits/men/18.jpg',
    country: '🇸🇪 Sweden',
  },
  {
    name: 'Aisha Khan',
    username: '@aishak',
    body: 'The customer lifecycle segments transformed how we approach email marketing.',
    img: 'https://randomuser.me/api/portraits/women/37.jpg',
    country: '🇦🇪 UAE',
  },
  {
    name: 'Liam O\'Brien',
    username: '@liamob',
    body: 'Can\'t believe this is free. It\'s better than tools we paid thousands for.',
    img: 'https://randomuser.me/api/portraits/men/92.jpg',
    country: '🇮🇪 Ireland',
  },
];

// Split testimonials into groups for different columns
const col1 = testimonials.slice(0, 4);
const col2 = testimonials.slice(4, 8);
const col3 = testimonials.slice(8, 12);
const col4 = testimonials.slice(12, 16);
const col5 = testimonials.slice(0, 4);
const col6 = testimonials.slice(4, 8);

function TestimonialCard({ img, name, username, body, country }: (typeof testimonials)[number]) {
  return (
    <Card className="w-72 bg-card/90 backdrop-blur-sm border-border/50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9">
            <AvatarImage src={img} alt={name} loading="lazy" />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium text-foreground flex items-center gap-1">
              {name} <span className="text-xs">{country}</span>
            </figcaption>
            <p className="text-xs font-medium text-muted-foreground">{username}</p>
          </div>
        </div>
        <blockquote className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</blockquote>
      </CardContent>
    </Card>
  );
}

export function Testimonials3D() {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/50 via-background to-muted/50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative">
        <ScrollReveal>
          <div className="text-center mb-12 px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Wall of Love
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by <span className="text-primary">Klaviyo</span> marketers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what email marketers are saying about Aderai
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="relative flex h-[600px] w-full flex-row items-center justify-center overflow-hidden [perspective:300px]">
            <div
              className="flex flex-row items-center gap-6"
              style={{
                transform: 'translateX(0) translateY(0) translateZ(-50px) rotateX(15deg) rotateY(-8deg) rotateZ(15deg)',
              }}
            >
              <Marquee vertical repeat={4} className="[--duration:30s]">
                {col1.map((review, i) => (
                  <TestimonialCard key={`col1-${i}`} {...review} />
                ))}
              </Marquee>
              <Marquee vertical reverse repeat={4} className="[--duration:35s]">
                {col2.map((review, i) => (
                  <TestimonialCard key={`col2-${i}`} {...review} />
                ))}
              </Marquee>
              <Marquee vertical repeat={4} className="[--duration:28s]">
                {col3.map((review, i) => (
                  <TestimonialCard key={`col3-${i}`} {...review} />
                ))}
              </Marquee>
              <Marquee vertical reverse repeat={4} className="[--duration:32s]">
                {col4.map((review, i) => (
                  <TestimonialCard key={`col4-${i}`} {...review} />
                ))}
              </Marquee>
              <Marquee vertical repeat={4} className="[--duration:27s]">
                {col5.map((review, i) => (
                  <TestimonialCard key={`col5-${i}`} {...review} />
                ))}
              </Marquee>
              <Marquee vertical reverse repeat={4} className="[--duration:33s]">
                {col6.map((review, i) => (
                  <TestimonialCard key={`col6-${i}`} {...review} />
                ))}
              </Marquee>
            </div>
            {/* Gradient overlays */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/80 to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10"></div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
