export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  nextEvent?: {
    time: string;
    location: string;
  };
}

export const CLUBS: Club[] = [
  {
    id: '1',
    name: 'Robotics Team',
    description: 'Building the future, one bot at a time. Join us to learn about mechanics, electronics, and coding.',
    category: 'Technology',
    tags: ['coding', 'engineering', 'hardware', 'tech'],
    image: 'https://images.unsplash.com/photo-1561557944-6e7860d5a6ea?q=80&w=300&auto=format&fit=crop',
    nextEvent: { time: 'Tue 6-8 PM', location: 'Engineering Bldg 1220' },
  },
  {
    id: '2',
    name: 'Debate Club',
    description: 'Voice your opinion and master the art of persuasion. We discuss current events and philosophical topics.',
    category: 'Academic',
    tags: ['speaking', 'politics', 'social', 'academic'],
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=300&auto=format&fit=crop',
    nextEvent: { time: 'Wed 7-9 PM', location: 'Wells Hall B115' },
  },
  {
    id: '3',
    name: 'Photography Society',
    description: 'Capture the world through your lens. Weekly photo walks and editing workshops.',
    category: 'Arts',
    tags: ['creative', 'art', 'social', 'outdoor'],
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=300&auto=format&fit=crop',
    nextEvent: { time: 'Sun 2-4 PM', location: 'Kresge Art Center 108' },
  },
  {
    id: '4',
    name: 'Varsity Soccer',
    description: 'Competitive soccer team representing our school. Tryouts held every semester.',
    category: 'Sports',
    tags: ['sports', 'fitness', 'team', 'outdoor'],
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade8f55?q=80&w=300&auto=format&fit=crop',
    nextEvent: { time: 'Mon 5-7 PM', location: 'IM Sports West Field 1' },
  },
  {
    id: '5',
    name: 'Cooking Club',
    description: 'Explore cuisines from around the world. No prior experience needed, just a love for food!',
    category: 'Lifestyle',
    tags: ['food', 'creative', 'social', 'indoor'],
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=300&auto=format&fit=crop',
    nextEvent: { time: 'Thu 6-8 PM', location: 'Demonstration Hall Kitchen' },
  },
  {
    id: '6',
    name: 'Chess Club',
    description: 'Sharpen your mind and improved your strategy. Open to all skill levels.',
    category: 'Game',
    tags: ['strategy', 'game', 'intellectual', 'indoor'],
    image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=300&auto=format&fit=crop',
    nextEvent: { time: 'Fri 7-10 PM', location: 'MSU Union 3rd Floor' },
  },
  {
    id: '7',
    name: 'Environmental Alliance',
    description: 'Working together to make our campus and community greener. Sustainability projects and cleanups.',
    category: 'Volunteering',
    tags: ['nature', 'volunteering', 'outdoor', 'social'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb77c35d?q=80&w=300&auto=format&fit=crop',
    nextEvent: { time: 'Sat 10 AM-2 PM', location: 'Red Cedar River Bank' },
  },
  {
    id: '8',
    name: 'Jazz Band',
    description: 'Groove with us. Seeking trumpet players, drummers, and saxophonists for our ensemble.',
    category: 'Music',
    tags: ['music', 'art', 'performance', 'creative'],
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300&auto=format&fit=crop',
    nextEvent: { time: 'Wed 8-10 PM', location: 'Music Building 103' },
  },
];
