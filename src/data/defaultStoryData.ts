import { ChapterItem, MemoryItem } from "../types";

export const DEFAULT_CHAPTERS: ChapterItem[] = [
  {
    id: "chapter-1",
    order: 1,
    title: "The Beginning",
    date: "November 2, 2024",
    description: "The spark that started it all. Nervous first hellos, late-night coffees, and the moment we knew something special was happening.",
    cover_image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop",
    highlight_count: 3
  },
  {
    id: "chapter-2",
    order: 2,
    title: "Getting to Know You",
    date: "Winter 2024 - Spring 2025",
    description: "Unfolding our favorite records, childhood stories, quirky habits, and realizing how easily our rhythms fell into place.",
    cover_image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop",
    highlight_count: 4
  },
  {
    id: "chapter-3",
    order: 3,
    title: "Growing Together",
    date: "Summer 2025",
    description: "Spontaneous road trips, sun-drenched beach picnics, cooking disasters that turned into pizza nights, and learning each other's languages of love.",
    cover_image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop",
    highlight_count: 4
  },
  {
    id: "chapter-4",
    order: 4,
    title: "Everything In Between",
    date: "Autumn 2025",
    description: "The quiet, unscripted days. Grocery shopping on lazy Sunday mornings, forehead kisses in the rain, and ordinary moments turned sacred.",
    cover_image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200&auto=format&fit=crop",
    highlight_count: 3
  },
  {
    id: "chapter-5",
    order: 5,
    title: "One Year",
    date: "November 2, 2025",
    description: "365 days of laughter, warmth, and quiet certainty. Celebrating our first full trip around the sun together.",
    cover_image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
    highlight_count: 3
  },
  {
    id: "chapter-6",
    order: 6,
    title: "Two Years — November 2, 2026",
    date: "November 2, 2026",
    description: "Two complete years of being each other's home. Our biggest milestone yet, and the prologue to all the adventures waiting ahead.",
    cover_image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop",
    highlight_count: 2
  }
];

export const DEFAULT_MEMORIES: Record<string, MemoryItem[]> = {
  "chapter-1": [
    {
      id: "mem-101",
      chapter_id: "chapter-1",
      title: "Our Very First Conversation",
      date: "November 2, 2024",
      location: "Corner Cafe on Hayes St",
      description: "We intended to only grab a quick 30-minute espresso, but ended up sitting at that tiny wooden corner table for over four hours until the cafe staff started turning off the lights.",
      song: {
        title: "Leon Bridges",
        artist: "Texas Sun"
      },
      media: [
        {
          id: "med-101-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1000&auto=format&fit=crop",
          caption: "The little table near the window where hours felt like minutes.",
          date: "Nov 2, 2024",
          film_type: "35mm Grain"
        },
        {
          id: "med-101-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop",
          caption: "Two untouched cold brews because we couldn't stop talking.",
          date: "Nov 2, 2024",
          film_type: "Warm Polaroid"
        },
        {
          id: "med-101-3",
          order: 3,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop",
          caption: "Walking down the street afterwards under the autumn streetlamps.",
          date: "Nov 2, 2024",
          film_type: "Night Snapshot"
        }
      ]
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
      media: [
        {
          id: "med-102-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
          caption: "City lights coming to life right as the dusk turned into deep navy.",
          date: "Nov 14, 2024",
          film_type: "Polaroid 600"
        },
        {
          id: "med-102-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop",
          caption: "Our hands warming up with that thermos. The moment we knew.",
          date: "Nov 14, 2024",
          film_type: "Color Film"
        },
        {
          id: "med-102-3",
          order: 3,
          type: "video",
          storage_path: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          caption: "Short video clip of the breezy sunset skyline.",
          date: "Nov 14, 2024",
          film_type: "Super 8 Video"
        }
      ]
    },
    {
      id: "mem-103",
      chapter_id: "chapter-1",
      title: "First Record Store Treasure Hunt",
      date: "December 1, 2024",
      location: "Amoeba Music",
      description: "Flipping through dusty vinyl crates searching for obscure indie tracks, whispering lyrics into each other's ears through sample headphones.",
      media: [
        {
          id: "med-103-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1000&auto=format&fit=crop",
          caption: "You proudly holding up that vintage Fleetwood Mac LP.",
          date: "Dec 1, 2024",
          film_type: "Vintage 35mm"
        },
        {
          id: "med-103-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop",
          caption: "Candid laughter by the headphone station.",
          date: "Dec 1, 2024",
          film_type: "Black & White"
        },
        {
          id: "med-103-3",
          order: 3,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?q=80&w=1000&auto=format&fit=crop",
          caption: "The paper bag we carried home with our first joint record collection.",
          date: "Dec 1, 2024",
          film_type: "Instant Film"
        }
      ]
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
      media: [
        {
          id: "med-201-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop",
          caption: "Morning light breaking across the snowdrifts outside the cabin.",
          date: "Jan 18, 2025",
          film_type: "Winter Daylight"
        },
        {
          id: "med-201-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=1000&auto=format&fit=crop",
          caption: "Your red beanie and frozen eyelashes after our snowshoe trail.",
          date: "Jan 19, 2025",
          film_type: "Polaroid"
        },
        {
          id: "med-201-3",
          order: 3,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
          caption: "By the hearth: wool socks, two mugs, and zero cellular reception.",
          date: "Jan 19, 2025",
          film_type: "Warm Glow"
        },
        {
          id: "med-201-4",
          order: 4,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1000&auto=format&fit=crop",
          caption: "The snowy path that led down to the quiet lake.",
          date: "Jan 20, 2025",
          film_type: "35mm Slide"
        }
      ]
    },
    {
      id: "mem-202",
      chapter_id: "chapter-2",
      title: "Cooking Class Chaos",
      date: "March 22, 2025",
      location: "Little Italy Kitchen Workshop",
      description: "Our attempt to make handmade ravioli ended with flour all over our noses, torn dough, and the most delicious imperfect meal we ever tasted.",
      media: [
        {
          id: "med-202-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop",
          caption: "Flour dusted across the kitchen countertop and everywhere else.",
          date: "Mar 22, 2025",
          film_type: "Candid"
        },
        {
          id: "med-202-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1000&auto=format&fit=crop",
          caption: "The final plate: messy shapes, 10/10 flavor, made with love.",
          date: "Mar 22, 2025",
          film_type: "Warm Kodachrome"
        }
      ]
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
      media: [
        {
          id: "med-301-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
          caption: "The sheer cliffs dropping straight into turquoise waves.",
          date: "Jul 4, 2025",
          film_type: "Golden Hour 35mm"
        },
        {
          id: "med-301-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
          caption: "The trusty rental car pulled over at our secret lookout spot.",
          date: "Jul 4, 2025",
          film_type: "Polaroid Color"
        },
        {
          id: "med-301-3",
          order: 3,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
          caption: "Sandy toes and ocean breeze just before sunset.",
          date: "Jul 5, 2025",
          film_type: "Sunflare Film"
        },
        {
          id: "med-301-4",
          order: 4,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1509233725247-49e657c54213?q=80&w=1000&auto=format&fit=crop",
          caption: "Pink sunset skies reflecting on the wet beach tide.",
          date: "Jul 5, 2025",
          film_type: "Fujifilm Velvia"
        }
      ]
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
      media: [
        {
          id: "med-401-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
          caption: "Afternoon sun pouring through the leafy kitchen curtains.",
          date: "Jun 18, 2025",
          film_type: "Portra 400"
        },
        {
          id: "med-401-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop",
          caption: "Your favorite book resting next to half-eaten peach slices.",
          date: "Jun 18, 2025",
          film_type: "Analog Polaroid"
        },
        {
          id: "med-401-3",
          order: 3,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1000&auto=format&fit=crop",
          caption: "The green garden after the sudden summer shower.",
          date: "Jun 18, 2025",
          film_type: "Soft Focus"
        }
      ]
    }
  ],
  "chapter-5": [
    {
      id: "mem-501",
      chapter_id: "chapter-5",
      title: "365 Days Together",
      date: "November 2, 2025",
      location: "Rooftop Conservatory",
      description: "One year of us. We exchanged handwritten letters and re-read our first messages to each other from exactly one year prior.",
      song: {
        title: "Taylor Swift",
        artist: "Lover"
      },
      media: [
        {
          id: "med-501-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop",
          caption: "Candlelight, warm laughter, and our anniversary toast.",
          date: "Nov 2, 2025",
          film_type: "Polaroid"
        },
        {
          id: "med-501-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000&auto=format&fit=crop",
          caption: "The envelope sealed with red wax holding our 1-year vows.",
          date: "Nov 2, 2025",
          film_type: "35mm Grain"
        }
      ]
    }
  ],
  "chapter-6": [
    {
      id: "mem-601",
      chapter_id: "chapter-6",
      title: "The Second Anniversary Milestone",
      date: "November 2, 2026",
      location: "Where It All Began",
      description: "730 days of shared dreams, milestones, unconditional support, and infinite love. Here's to everything we've been, everything we are, and everything that's still waiting for us.",
      song: {
        title: "Kacey Musgraves",
        artist: "Butterflies"
      },
      media: [
        {
          id: "med-601-1",
          order: 1,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop",
          caption: "Two years of golden memories.",
          date: "Nov 2, 2026",
          film_type: "Memory Film"
        },
        {
          id: "med-601-2",
          order: 2,
          type: "image",
          storage_path: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1000&auto=format&fit=crop",
          caption: "Walking toward the horizon together.",
          date: "Nov 2, 2026",
          film_type: "Cinematic Still"
        }
      ]
    }
  ]
};
