import { ChapterItem, MemoryItem } from "../types";

export const DEFAULT_CHAPTERS: ChapterItem[] = [
  {
    id: "chapter-1",
    order: 1,
    title: "The Beginning",
    date: "November 3, 2024",
    description: "The spark that started it all. Nervous first hellos, late-night coffees, and the moment we knew something special was happening.",
    highlight_count: 3
  },
  {
    id: "chapter-2",
    order: 2,
    title: "Getting to Know You",
    date: "Winter 2024 - Spring 2025",
    description: "Unfolding our favorite records, childhood stories, quirky habits, and realizing how easily our rhythms fell into place.",
    highlight_count: 4
  },
  {
    id: "chapter-3",
    order: 3,
    title: "Growing Together",
    date: "Summer 2025",
    description: "Spontaneous road trips, sun-drenched beach picnics, cooking disasters that turned into pizza nights, and learning each other's languages of love.",
    highlight_count: 4
  },
  {
    id: "chapter-4",
    order: 4,
    title: "Everything In Between",
    date: "Autumn 2025",
    description: "The quiet, unscripted days. Grocery shopping on lazy Sunday mornings, forehead kisses in the rain, and ordinary moments turned sacred.",
    highlight_count: 3
  },
  {
    id: "chapter-5",
    order: 5,
    title: "One Year",
    date: "November 3, 2025",
    description: "365 days of laughter, warmth, and quiet certainty. Celebrating our first full trip around the sun together.",
    highlight_count: 3
  },
  {
    id: "chapter-6",
    order: 6,
    title: "Two Years — November 3, 2026",
    date: "November 3, 2026",
    description: "Two complete years of being each other's home. Our biggest milestone yet, and the prologue to all the adventures waiting ahead.",
    highlight_count: 2
  }
];

export const DEFAULT_MEMORIES: Record<string, MemoryItem[]> = {
  "chapter-1": [
    {
      id: "mem-101",
      chapter_id: "chapter-1",
      title: "Our Very First Conversation",
      date: "November 3, 2024",
      location: "Corner Cafe on Hayes St",
      description: "We intended to only grab a quick 30-minute espresso, but ended up sitting at that tiny wooden corner table for over four hours until the cafe staff started turning off the lights.",
      song: {
        title: "Leon Bridges",
        artist: "Texas Sun"
      },
      media: []
    },
    {
      id: "mem-102",
      chapter_id: "chapter-1",
      title: "The Evening Viewpoint Stroll",
      date: "November 14, 2024",
      location: "Twin Peaks Overlook",
      description: "You brought an oversized thermos of peppermint hot chocolate and we shared a single woolen blanket looking down over the sparkling city lights.",
      song: {
        title: "Norah Jones",
        artist: "Come Away With Me"
      },
      media: []
    },
    {
      id: "mem-103",
      chapter_id: "chapter-1",
      title: "First Record Store Treasure Hunt",
      date: "December 1, 2024",
      location: "Amoeba Music",
      description: "Flipping through dusty vinyl crates searching for obscure indie tracks, whispering lyrics into each other's ears through sample headphones.",
      media: []
    }
  ],
  "chapter-2": [
    {
      id: "mem-201",
      chapter_id: "chapter-2",
      title: "Snowy Cabin Weekend",
      date: "January 18, 2025",
      location: "Lake Tahoe, CA",
      description: "Surrounded by pine trees buried in fresh snow. Building an oversized snowman that leaned sideways, and drinking spiced cider by a crackling wood fire.",
      song: {
        title: "Bon Iver",
        artist: "Holocene"
      },
      media: []
    },
    {
      id: "mem-202",
      chapter_id: "chapter-2",
      title: "Cooking Class Chaos",
      date: "March 22, 2025",
      location: "Little Italy Kitchen Workshop",
      description: "Our attempt to make handmade ravioli ended with flour all over our noses, torn dough, and the most delicious imperfect meal we ever tasted.",
      media: []
    }
  ],
  "chapter-3": [
    {
      id: "mem-301",
      chapter_id: "chapter-3",
      title: "Pacific Coastline Highway Escape",
      date: "July 4, 2025",
      location: "Big Sur & Bixby Bridge",
      description: "Windows rolled down, coastal sea mist, singing along at top volume to our summer playlist as the Pacific Ocean unfolded beside us.",
      song: {
        title: "Lord Huron",
        artist: "The Night We Met"
      },
      media: []
    }
  ],
  "chapter-4": [
    {
      id: "mem-401",
      chapter_id: "chapter-4",
      title: "That Random Day",
      date: "June 18, 2025",
      location: "Our Sunny Apartment Porch",
      description: "We weren't doing anything special. Making iced tea, reading books on the floor cushions, listening to rainfall. Somehow this became one of my all-time favorite memories.",
      song: {
        title: "Fleet Foxes",
        artist: "Helplessness Blues"
      },
      media: []
    }
  ],
  "chapter-5": [
    {
      id: "mem-501",
      chapter_id: "chapter-5",
      title: "365 Days Together",
      date: "November 3, 2025",
      location: "Rooftop Conservatory",
      description: "One year of us. We exchanged handwritten letters and re-read our first messages to each other from exactly one year prior.",
      song: {
        title: "Taylor Swift",
        artist: "Lover"
      },
      media: []
    }
  ],
  "chapter-6": [
    {
      id: "mem-601",
      chapter_id: "chapter-6",
      title: "The Second Anniversary Milestone",
      date: "November 3, 2026",
      location: "Where It All Began",
      description: "730 days of shared dreams, milestones, unconditional support, and infinite love. Here's to everything we've been, everything we are, and everything that's still waiting for us.",
      song: {
        title: "Kacey Musgraves",
        artist: "Butterflies"
      },
      media: []
    }
  ]
};
