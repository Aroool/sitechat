import {
  sid,
  type Feature,
  type Product,
  type Section,
  type SiteCategory,
  type SiteSpec,
  type SiteThemeId,
} from "./types";

/**
 * A recipe turns a handful of answers into a complete SiteSpec with rich,
 * subtype-aware default content. The assistant's follow-up questions exist
 * to fill these parameters — nothing more, which is why the flow stays short.
 */

export interface RecipeQuestion {
  id: string;
  question: string;
  options: { id: string; label: string }[];
}

export interface BuildParams {
  name: string;
  subtype: string;
  answers: Record<string, string>;
  themeId: SiteThemeId;
}

export interface Recipe {
  category: SiteCategory;
  label: string;
  /** One category-specific question (fulfillment, booking, pricing model…). */
  domainQuestion?: RecipeQuestion;
  nameIdeas: (subtype: string) => string[];
  build: (p: BuildParams) => SiteSpec;
}

const nav = (links: string[], cta?: string): Section => ({
  id: sid("navbar"),
  type: "navbar",
  links,
  cta,
});

const footer = (): Section => ({ id: sid("footer"), type: "footer" });

/* ---------------------------------- ecommerce --------------------------------- */

const PRODUCT_PACKS: Record<string, Product[]> = {
  grocery: [
    { name: "Hass avocados", price: "$2.49", emoji: "🥑", tag: "Fresh" },
    { name: "Sourdough loaf", price: "$4.20", emoji: "🍞" },
    { name: "Organic milk", price: "$3.10", emoji: "🥛" },
    { name: "Free-range eggs", price: "$4.80", emoji: "🥚" },
    { name: "Strawberries", price: "$3.99", emoji: "🍓", tag: "In season" },
    { name: "Baby spinach", price: "$2.75", emoji: "🥬" },
    { name: "Vine tomatoes", price: "$2.20", emoji: "🍅" },
    { name: "Aged cheddar", price: "$6.50", emoji: "🧀" },
  ],
  bakery: [
    { name: "Butter croissant", price: "$3.50", emoji: "🥐", tag: "Bestseller" },
    { name: "Country sourdough", price: "$6.00", emoji: "🍞" },
    { name: "Cinnamon roll", price: "$4.25", emoji: "🧁" },
    { name: "Choc-chip cookies", price: "$2.75", emoji: "🍪" },
    { name: "Baguette", price: "$3.20", emoji: "🥖" },
    { name: "Berry danish", price: "$4.50", emoji: "🫐", tag: "New" },
  ],
  fashion: [
    { name: "Wool overcoat", price: "$189", emoji: "🧥", tag: "New" },
    { name: "Linen dress", price: "$120", emoji: "👗" },
    { name: "Court sneakers", price: "$95", emoji: "👟" },
    { name: "Leather tote", price: "$150", emoji: "👜", tag: "Bestseller" },
    { name: "Canvas cap", price: "$35", emoji: "🧢" },
    { name: "Aviator shades", price: "$80", emoji: "🕶️" },
    { name: "Silk scarf", price: "$60", emoji: "🧣" },
    { name: "Chelsea boots", price: "$140", emoji: "🥾" },
  ],
  generic: [
    { name: "Starter bundle", price: "$29", emoji: "📦", tag: "Popular" },
    { name: "Everyday essential", price: "$18", emoji: "⭐" },
    { name: "Gift set", price: "$45", emoji: "🎁" },
    { name: "Limited edition", price: "$60", emoji: "✨", tag: "New" },
    { name: "Refill pack", price: "$12", emoji: "🔄" },
    { name: "Deluxe kit", price: "$75", emoji: "💎" },
  ],
};

function fulfillmentFeatures(answer: string, subtype: string): Feature[] {
  const thing = subtype === "grocery" ? "groceries" : "order";
  const delivery: Feature = {
    emoji: "🚚",
    title: "Fast local delivery",
    desc: `Your ${thing} at the door in under an hour, same day every day.`,
  };
  const pickup: Feature = {
    emoji: "🛍️",
    title: "Easy in-store pickup",
    desc: "Order ahead, skip the line — ready when you arrive.",
  };
  const quality: Feature = {
    emoji: "✅",
    title: "Quality guaranteed",
    desc: "Not happy with an item? We refund it, no questions asked.",
  };
  const fresh: Feature = {
    emoji: "🌱",
    title: "Sourced fresh daily",
    desc: "We work directly with local farms and makers.",
  };
  if (answer === "delivery") return [delivery, fresh, quality];
  if (answer === "pickup") return [pickup, fresh, quality];
  return [delivery, pickup, quality];
}

const ecommerce: Recipe = {
  category: "ecommerce",
  label: "Online store",
  domainQuestion: {
    id: "fulfillment",
    question: "How do customers get their orders?",
    options: [
      { id: "both", label: "Delivery and pickup" },
      { id: "delivery", label: "Delivery only" },
      { id: "pickup", label: "Pickup only" },
    ],
  },
  nameIdeas: (subtype) =>
    subtype === "grocery"
      ? ["Fresh Basket", "Corner Greens", "Daily Harvest Market"]
      : subtype === "bakery"
        ? ["Golden Crumb", "The Morning Oven", "Flour & Co."]
        : subtype === "fashion"
          ? ["Atelier North", "Thread & Form", "Common Cloth"]
          : ["The Goods Shop", "Neat Supply", "Made & Found"],
  build: ({ name, subtype, answers, themeId }) => {
    const products = PRODUCT_PACKS[subtype] ?? PRODUCT_PACKS.generic;
    const fulfillment = answers.fulfillment ?? "both";
    const heroNote =
      fulfillment === "pickup"
        ? "Order online — ready for pickup in 20 minutes"
        : "Free delivery on orders over $30";
    return {
      name,
      tagline: subtype === "grocery" ? "Fresh groceries, fast" : "Shop online",
      category: "ecommerce",
      themeId,
      sections: [
        nav(["Shop", "Deals", "About"], "Cart"),
        {
          id: sid("hero"),
          type: "hero",
          kicker: subtype === "grocery" ? "Farm fresh, every day" : "New season",
          headline:
            subtype === "grocery"
              ? "Fresh groceries, delivered in 30 minutes"
              : subtype === "bakery"
                ? "Baked before sunrise, gone by noon"
                : subtype === "fashion"
                  ? "Wardrobe staples, made to last"
                  : `Everything you love from ${name}`,
          sub:
            subtype === "grocery"
              ? "Local produce, pantry staples, and small-batch goods — picked fresh and brought to your door."
              : "Quality you can feel, prices that make sense, and a checkout that takes seconds.",
          cta: "Shop now",
          secondaryCta: "Browse deals",
          note: heroNote,
        },
        {
          id: sid("features"),
          type: "features",
          title: `Why shop with ${name}`,
          items: fulfillmentFeatures(fulfillment, subtype),
        },
        {
          id: sid("productGrid"),
          type: "productGrid",
          title: "Popular right now",
          products,
        },
        {
          id: sid("testimonials"),
          type: "testimonials",
          title: "Loved by locals",
          items: [
            {
              quote: "Groceries arrive faster than I can find my shoes. Unreal.",
              name: "Priya S.",
              role: "Orders weekly",
            },
            {
              quote: "The produce is genuinely fresher than the big chains.",
              name: "Marcus T.",
              role: "Customer for 2 years",
            },
            {
              quote: "Checkout took 30 seconds. I'm never going back.",
              name: "Elena R.",
              role: "First-time buyer",
            },
          ],
        },
        {
          id: sid("cta"),
          type: "cta",
          headline: "Your first delivery is on us",
          sub: "Use code WELCOME at checkout — today only.",
          button: "Start shopping",
        },
        footer(),
      ],
    };
  },
};

/* ------------------------------------ saas ------------------------------------ */

const saas: Recipe = {
  category: "saas",
  label: "Product landing page",
  domainQuestion: {
    id: "pricing",
    question: "How will you charge?",
    options: [
      { id: "freemium", label: "Free plan + paid tiers" },
      { id: "trial", label: "Free trial, then paid" },
      { id: "sales", label: "Talk to sales" },
    ],
  },
  nameIdeas: () => ["Loopdeck", "Signalpost", "Driftbase"],
  build: ({ name, answers, themeId }) => {
    const pricing = answers.pricing ?? "freemium";
    return {
      name,
      tagline: "Ship faster",
      category: "saas",
      themeId,
      sections: [
        nav(["Product", "Pricing", "Docs", "Blog"], "Get started"),
        {
          id: sid("hero"),
          type: "hero",
          kicker: "Now in public beta",
          headline: `Ship real-time features without the infrastructure`,
          sub: `${name} handles sync, presence, and state so your team can focus on product — not plumbing.`,
          cta: pricing === "sales" ? "Book a demo" : "Start free",
          secondaryCta: "Read the docs",
          note: "No credit card required",
        },
        {
          id: sid("stats"),
          type: "stats",
          items: [
            { value: "99.99%", label: "Uptime SLA" },
            { value: "<40ms", label: "Global latency" },
            { value: "12k+", label: "Developers" },
            { value: "SOC 2", label: "Type II certified" },
          ],
        },
        {
          id: sid("features"),
          type: "features",
          title: "Everything you need to go live",
          items: [
            {
              emoji: "⚡",
              title: "Real-time sync",
              desc: "State replicated across clients in milliseconds, conflict-free.",
            },
            {
              emoji: "🔐",
              title: "Auth built in",
              desc: "Sessions, roles, and row-level permissions out of the box.",
            },
            {
              emoji: "📈",
              title: "Scales with you",
              desc: "From weekend project to millions of users — no re-architecture.",
            },
          ],
        },
        {
          id: sid("pricing"),
          type: "pricing",
          title: "Simple, honest pricing",
          plans:
            pricing === "sales"
              ? [
                  { name: "Team", price: "$99", period: "mo", features: ["Up to 20 seats", "Standard support", "Community access"] },
                  { name: "Business", price: "$399", period: "mo", features: ["Unlimited seats", "Priority support", "SSO + audit logs"], featured: true },
                  { name: "Enterprise", price: "Custom", period: "yr", features: ["Dedicated infra", "SLAs + DPA", "Solutions engineer"] },
                ]
              : [
                  { name: "Free", price: "$0", period: "mo", features: ["2 projects", "1k monthly users", "Community support"] },
                  { name: "Pro", price: "$29", period: "mo", features: ["Unlimited projects", "100k monthly users", "Email support"], featured: true },
                  { name: "Scale", price: "$149", period: "mo", features: ["Everything in Pro", "SSO + audit logs", "Priority support"] },
                ],
        },
        {
          id: sid("testimonials"),
          type: "testimonials",
          title: "Teams ship faster with " + name,
          items: [
            {
              quote: "We deleted 4,000 lines of websocket code the week we adopted it.",
              name: "Dana K.",
              role: "CTO, Fieldnote",
            },
            {
              quote: "The first infra product our frontend team actually enjoys.",
              name: "Sam O.",
              role: "Staff engineer, Relay",
            },
            {
              quote: "Went from prototype to 50k users without touching a server.",
              name: "Ines M.",
              role: "Founder, Cartographer",
            },
          ],
        },
        {
          id: sid("cta"),
          type: "cta",
          headline: "Start building tonight",
          sub: "Free to try. Five minutes to first sync.",
          button: pricing === "sales" ? "Book a demo" : "Create your account",
        },
        footer(),
      ],
    };
  },
};

/* ---------------------------------- portfolio ---------------------------------- */

const GALLERY_PACKS: Record<string, { label: string; emoji: string }[]> = {
  photographer: [
    { label: "Golden hour, Lisbon", emoji: "🌅" },
    { label: "Street series, Tokyo", emoji: "🏙️" },
    { label: "Portrait study 04", emoji: "🎞️" },
    { label: "Coastline, Big Sur", emoji: "🌊" },
    { label: "Night market", emoji: "🏮" },
    { label: "Analog archive", emoji: "📷" },
  ],
  designer: [
    { label: "Fintech rebrand", emoji: "💳" },
    { label: "Editorial system", emoji: "📰" },
    { label: "Type specimen", emoji: "🔠" },
    { label: "Packaging suite", emoji: "📦" },
    { label: "App concept", emoji: "📱" },
    { label: "Poster series", emoji: "🖼️" },
  ],
  developer: [
    { label: "Realtime dashboard", emoji: "📊" },
    { label: "CLI toolkit", emoji: "⌨️" },
    { label: "Open-source lib", emoji: "🧩" },
    { label: "Game prototype", emoji: "🎮" },
    { label: "ML pipeline", emoji: "🤖" },
    { label: "Design system", emoji: "🎨" },
  ],
  generic: [
    { label: "Selected work 01", emoji: "✨" },
    { label: "Selected work 02", emoji: "🌀" },
    { label: "Selected work 03", emoji: "🌿" },
    { label: "Collaboration", emoji: "🤝" },
    { label: "Experiment", emoji: "🧪" },
    { label: "Archive", emoji: "🗂️" },
  ],
};

const portfolio: Recipe = {
  category: "portfolio",
  label: "Portfolio",
  nameIdeas: (subtype) =>
    subtype === "photographer"
      ? ["Mara Lindqvist", "June Okafor", "Theo Aldous"]
      : ["Alex Reyes", "Noa Winter", "Kit Harlan"],
  build: ({ name, subtype, themeId }) => {
    const craft =
      subtype === "photographer"
        ? "Photographer"
        : subtype === "designer"
          ? "Designer"
          : subtype === "developer"
            ? "Developer"
            : "Creative";
    return {
      name,
      tagline: craft,
      category: "portfolio",
      themeId,
      sections: [
        nav(["Work", "About", "Contact"]),
        {
          id: sid("hero"),
          type: "hero",
          kicker: craft,
          headline:
            subtype === "photographer"
              ? "Honest light, quiet stories"
              : subtype === "developer"
                ? "I build software worth keeping"
                : "Work that says the quiet part out loud",
          sub: `${name} — available for commissions and collaborations worldwide.`,
          cta: "View work",
          secondaryCta: "Get in touch",
        },
        {
          id: sid("gallery"),
          type: "gallery",
          title: "Selected work",
          items: GALLERY_PACKS[subtype] ?? GALLERY_PACKS.generic,
        },
        {
          id: sid("about"),
          type: "about",
          title: "About",
          body:
            subtype === "photographer"
              ? "Ten years chasing light across four continents. My work sits between documentary and portrait — patient, unposed, printed by hand whenever possible. Clients include editorial houses, independent labels, and people who simply want to be seen clearly."
              : "I care about craft: the details most people never notice but everyone feels. Over the last decade I've worked with startups and studios to make things that are useful, honest, and a little bit delightful.",
        },
        {
          id: sid("testimonials"),
          type: "testimonials",
          title: "Kind words",
          items: [
            {
              quote: "Working together was the easiest part of our launch.",
              name: "R. Alvarez",
              role: "Creative director",
            },
            {
              quote: "Rare mix of taste and reliability. Hire immediately.",
              name: "J. Chen",
              role: "Founder",
            },
          ],
        },
        {
          id: sid("contact"),
          type: "contact",
          title: "Let's talk",
          email: "hello@" + name.toLowerCase().replace(/[^a-z]/g, "") + ".com",
          phone: "+1 (415) 555-0134",
        },
        footer(),
      ],
    };
  },
};

/* ------------------------------------ local ------------------------------------ */

const local: Recipe = {
  category: "local",
  label: "Local business",
  domainQuestion: {
    id: "booking",
    question: "What should the main button do?",
    options: [
      { id: "reserve", label: "Take reservations" },
      { id: "order", label: "Order online" },
      { id: "visit", label: "Just show info" },
    ],
  },
  nameIdeas: (subtype) =>
    subtype === "cafe"
      ? ["Little Fern Cafe", "Morning Standard", "Cup & Compass"]
      : subtype === "salon"
        ? ["Studio Luxe", "The Fade Room", "Golden Hour Salon"]
        : subtype === "gym"
          ? ["Forge Athletics", "Northside Strength", "The Daily Rep"]
          : ["The Olive Branch", "Ember & Oak", "Harbor Table"],
  build: ({ name, subtype, answers, themeId }) => {
    const booking = answers.booking ?? "reserve";
    const ctaLabel =
      booking === "order" ? "Order online" : booking === "visit" ? "Find us" : subtype === "salon" || subtype === "gym" ? "Book a visit" : "Reserve a table";
    const isFood = subtype !== "salon" && subtype !== "gym";
    const menuSection: Section = isFood
      ? {
          id: sid("menu"),
          type: "menu",
          title: subtype === "cafe" ? "The menu" : "Dinner menu",
          groups:
            subtype === "cafe"
              ? [
                  {
                    name: "Coffee",
                    items: [
                      { name: "Flat white", price: "$4.50" },
                      { name: "Pour over", price: "$5.00", desc: "Single origin, rotating" },
                      { name: "Iced oat latte", price: "$5.50" },
                    ],
                  },
                  {
                    name: "Kitchen",
                    items: [
                      { name: "Ricotta toast", price: "$9.00", desc: "Honey, thyme, sea salt" },
                      { name: "Breakfast roll", price: "$11.00" },
                      { name: "Seasonal bowl", price: "$13.50" },
                    ],
                  },
                ]
              : [
                  {
                    name: "To start",
                    items: [
                      { name: "Burrata & peach", price: "$14", desc: "Basil oil, cracked pepper" },
                      { name: "Crispy calamari", price: "$16" },
                      { name: "Sourdough & cultured butter", price: "$6" },
                    ],
                  },
                  {
                    name: "Mains",
                    items: [
                      { name: "Wood-fired branzino", price: "$29", desc: "Charred lemon, salsa verde" },
                      { name: "Braised short rib", price: "$32" },
                      { name: "Wild mushroom risotto", price: "$24" },
                    ],
                  },
                ],
        }
      : {
          id: sid("menu"),
          type: "menu",
          title: "Services",
          groups:
            subtype === "salon"
              ? [
                  {
                    name: "Hair",
                    items: [
                      { name: "Cut & style", price: "$65" },
                      { name: "Full color", price: "$140", desc: "Includes gloss + blowout" },
                      { name: "Balayage", price: "$190" },
                    ],
                  },
                  {
                    name: "Extras",
                    items: [
                      { name: "Deep treatment", price: "$45" },
                      { name: "Event styling", price: "$85" },
                    ],
                  },
                ]
              : [
                  {
                    name: "Memberships",
                    items: [
                      { name: "Open gym", price: "$49/mo" },
                      { name: "Unlimited classes", price: "$89/mo", desc: "Strength, mobility, conditioning" },
                      { name: "Personal training", price: "$70/session" },
                    ],
                  },
                ],
        };

    return {
      name,
      tagline: subtype,
      category: "local",
      themeId,
      sections: [
        nav([isFood ? "Menu" : "Services", "About", "Contact"], ctaLabel),
        {
          id: sid("hero"),
          type: "hero",
          kicker:
            subtype === "cafe"
              ? "Open daily 7am – 4pm"
              : subtype === "salon"
                ? "Walk-ins welcome"
                : subtype === "gym"
                  ? "First week free"
                  : "Now taking reservations",
          headline:
            subtype === "cafe"
              ? "Slow mornings, serious coffee"
              : subtype === "salon"
                ? "Leave looking like the best version of you"
                : subtype === "gym"
                  ? "Stronger every single week"
                  : "Seasonal food, warm rooms, good company",
          sub: `${name} is a neighborhood favorite — honest prices, real craft, and people who remember your name.`,
          cta: ctaLabel,
          secondaryCta: isFood ? "See the menu" : "View services",
        },
        menuSection,
        {
          id: sid("features"),
          type: "features",
          title: "The regulars' reasons",
          items: [
            {
              emoji: "🏆",
              title: "Best in the neighborhood",
              desc: "Voted local favorite three years running.",
            },
            {
              emoji: "🌿",
              title: "Local & seasonal",
              desc: "We buy from growers and makers within 50 miles.",
            },
            {
              emoji: "💛",
              title: "Family owned",
              desc: "Running proudly since 2016 — and we remember your order.",
            },
          ],
        },
        {
          id: sid("contact"),
          type: "contact",
          title: "Visit us",
          address: "214 Maple Street, Portland, OR",
          phone: "(503) 555-0189",
          hours: "Tue–Sun · 7am – 4pm",
          email: "hi@" + name.toLowerCase().replace(/[^a-z]/g, "") + ".com",
        },
        footer(),
      ],
    };
  },
};

/* ----------------------------------- waitlist ---------------------------------- */

const waitlist: Recipe = {
  category: "waitlist",
  label: "Waitlist page",
  nameIdeas: () => ["Daybreak", "Otherhalf", "Fieldnotes"],
  build: ({ name, subtype, themeId }) => ({
    name,
    tagline: "Coming soon",
    category: "waitlist",
    themeId,
    sections: [
      nav(["About"]),
      {
        id: sid("hero"),
        type: "hero",
        kicker: "Coming soon",
        headline: `${name} is almost ready`,
        sub:
          subtype === "cafe" || subtype === "coffee"
            ? "A new neighborhood coffee shop with serious espresso and softer chairs. Opening this fall."
            : "We're building something worth the wait. Join the list and be first through the door.",
        cta: "Join the waitlist",
      },
      {
        id: sid("emailCapture"),
        type: "emailCapture",
        headline: "Be first in line",
        sub: "Early members get founding perks. No spam, ever — just the launch email.",
        placeholder: "you@example.com",
        button: "Join the waitlist",
      },
      {
        id: sid("features"),
        type: "features",
        title: "What's coming",
        items: [
          { emoji: "🎁", title: "Founding perks", desc: "Early members get lifetime benefits." },
          { emoji: "📅", title: "Launching soon", desc: "We're weeks away, not months." },
          { emoji: "💌", title: "One email", desc: "You'll hear from us exactly once — on launch day." },
        ],
      },
      footer(),
    ],
  }),
};

export const RECIPES: Record<SiteCategory, Recipe> = {
  ecommerce,
  saas,
  portfolio,
  local,
  waitlist,
};
