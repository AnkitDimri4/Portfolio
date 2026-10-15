// My resume's content, read through resume.js, which explains each part. Plain JSON in a module, so
// it can be rewritten whole by a program: keep notes in resume.js, not here.
export default {
  "CONTACT": {
    "name": "Ankit Dimri",
    "headline": "Software Engineer",
    "phone": "+91 9760763472",
    "email": "dimri.ankitdimri@gmail.com",
    "location": "Dehradun, India",
    "links": [
      {
        "icon": "github",
        "text": "GitHub",
        "href": "https://github.com/AnkitDimri4"
      },
      {
        "icon": "linkedin",
        "text": "LinkedIn",
        "href": "https://www.linkedin.com/in/ankit-dimri-a6ab98263/"
      },
      {
        "icon": "leetcode",
        "text": "LeetCode",
        "href": "https://leetcode.com/u/user4612MW/"
      },
      {
        "icon": "web",
        "text": "portfolio-nine-orcin-33.vercel.app",
        "href": "https://portfolio-nine-orcin-33.vercel.app/"
      },
      {
        "icon": "brain",
        "text": "Brain map",
        "href": "https://portfolio-nine-orcin-33.vercel.app/brain-map/"
      }
    ]
  },
  "BOOKING": {
    "enabled": true,
    "minutes": 30
  },
  "SUMMARY": "Software Engineer who builds and runs production systems end to end: iOS and Android apps (React Native), web (Next.js, React), APIs (Node.js, MongoDB), CI/CD (Jenkins) and cloud (GCP, AWS, Cloudflare). 3+ years across the MERN stack, React Native, Python and ML; mentor to 25,000+ learners.",
  "EXPERIENCE": [
    {
      "org": "FileSure India Pvt. Ltd.",
      "short": "FileSure",
      "location": "Remote",
      "github": {
        "contributions": 1299
      },
      "skills": [
        "React Native (Expo, EAS)",
        "App Store & Google Play releases",
        "Next.js",
        "Node.js / Express",
        "MongoDB",
        "ClickHouse",
        "Typesense",
        "Google Cloud (GCP)",
        "AWS",
        "Cloudflare",
        "NetBird (zero-trust access)",
        "Docker & Kubernetes",
        "Jenkins CI/CD",
        "Sentry, PostHog & Mixpanel",
        "Incident response",
        "Technical writing"
      ],
      "links": [
        {
          "label": "App Store",
          "short": "iOS app",
          "href": "https://apps.apple.com/in/app/filesure/id6759514259"
        },
        {
          "label": "Google Play",
          "short": "Android app",
          "href": "https://play.google.com/store/apps/details?id=in.filesure"
        },
        {
          "label": "filesure.in",
          "short": "Website",
          "href": "https://www.filesure.in"
        },
        {
          "label": "api.filesure.in",
          "short": "API",
          "href": "https://api.filesure.in"
        }
      ],
      "roles": [
        {
          "title": "Software Engineer",
          "type": "Full-time",
          "start": "Aug 2026",
          "end": "Oct 2026",
          "summary": "Ran FileSure's tech with the founder from July 2026: production, releases, the cloud and the mobile apps. Rebuilt company screening for all 3.8M companies in six days.",
          "highlights": [
            [
              "Company screening (3.8M companies)",
              [
                "Took filters from 60-second timeouts to seconds: counting moved from 26 searches per request to one ClickHouse scan, rebuilt hourly.",
                "Sped up a lookup step 7× (0.7 s → 0.1 s); a test on 3,000 random companies checks that the filter counts match the results.",
                "Built 42 sectors and 146 sub-sectors across both NIC code editions, with precision checked on 20 companies each.",
                "Classified 274K companies by their real business, read from their MGT-7 annual returns.",
                "Added FY25 and FY26 turnover and profit filters, growing the public companies with a turnover figure from 8 to 27,873."
              ]
            ],
            [
              "Mobile app",
              [
                "Launched the iOS app on the App Store on 3 Aug 2026 after meeting Apple's review rules (Sign in with Apple, iPad screenshots), and shipped both apps up to 1.0.13.",
                "Kept every build's version right with a version-sync script across 7 files, and made over-the-air updates reliable: ~50 shipped Aug–Oct without store review."
              ]
            ],
            [
              "Company-data API",
              [
                "Added director appointment and cessation history and ready-to-show capital figures to api.filesure.in, and fixed its public docs portal."
              ]
            ],
            [
              "Releases & infrastructure",
              [
                "Ran 7 tagged production releases in one week through gated Jenkins CI/CD pipelines, and handled incidents.",
                "Managed GCP (VMs, Cloud Storage), AWS and Cloudflare, with zero-trust server access over NetBird and 21 runbooks."
              ]
            ]
          ],
          "points": [
            "Rebuilt company screening for 3.8M companies on ClickHouse in 6 days: one scan instead of 26 searches took filters from 60 s timeouts to seconds.",
            "Built 42 sectors and 146 sub-sectors, classified 274K companies from MGT-7 returns, and grew turnover data from 8 to 27,873 public companies.",
            "Launched the iOS app on the App Store (3 Aug 2026) and shipped both apps to 1.0.13, with ~50 over-the-air updates from Aug to Oct.",
            "Added director history and ready-to-show capital to the API, and fixed its docs.",
            "Ran the tech with the founder: 7 releases in a week via gated Jenkins CI/CD, incidents, 21 runbooks; GCP, AWS, Cloudflare and NetBird zero-trust access."
          ]
        },
        {
          "title": "Tech Support & Operations Intern",
          "type": "Internship",
          "start": "Apr 2026",
          "end": "Jul 2026",
          "summary": "Built FileSure's iOS and Android apps from scratch and led the backend's move from AWS to GCP. Promoted to full-time Software Engineer after 3 months of a planned 6-month internship.",
          "highlights": [
            [
              "Mobile app (built from scratch)",
              [
                "Built the iOS and Android apps in React Native (Expo), writing 92 of the app's first 100 commits: email, Google and Apple sign-in, payments, push notifications, an admin panel, cart sync with the website, and Sentry and PostHog monitoring.",
                "Launched the Android app on Google Play on 13 July 2026, then shipped 35+ over-the-air updates that month, including support chat shared with the website and a cart that survives app restarts."
              ]
            ],
            [
              "Cloud migration (AWS → GCP)",
              [
                "Led the backend's move to GCP (GKE, Artifact Registry) behind a gated Jenkins pipeline, with a low DNS TTL, an early certificate and an instant rollback plan.",
                "Moved every backend secret to GCP Secret Manager, with a check that stops startup if one is missing.",
                "Set up production search on GCP: 3.67M companies and 8.7M directors indexed with 0 failures.",
                "Set up the first MongoDB server on GCP and validated a full database restore with 0 failed documents.",
                "Built staging and CI on GCP (Jenkins, Docker, nginx), with a separate staging URL for every build version."
              ]
            ],
            [
              "APIs, support & docs",
              [
                "Built the name → CIN/DIN lookup API, which returns each match with the fields to pick the right one, with OpenAPI docs, a developer guide and sandbox tests.",
                "Resolved support tickets end to end, tracing what users saw to backend root causes, and wrote 15 docs and runbooks."
              ]
            ]
          ],
          "points": [
            "Built FileSure's iOS and Android app from scratch in React Native (Expo), writing 92 of its first 100 commits: sign-in, payments, push; on Google Play from 13 Jul 2026.",
            "Led the backend's move from AWS to GCP (Kubernetes) behind a gated Jenkins pipeline, and indexed 3.67M companies and 8.7M directors with 0 failures.",
            "Built the name → CIN/DIN lookup API with OpenAPI docs and sandbox tests; resolved support tickets end to end and wrote 15 docs and runbooks.",
            "Promoted to full-time Software Engineer after 3 months of a 6-month internship."
          ]
        }
      ]
    },
    {
      "org": "Tutedude",
      "location": "Remote",
      "roles": [
        {
          "title": "Technical Mentor – Full Stack, React Native & AI/ML",
          "type": "Part-time",
          "start": "Feb 2023",
          "end": "Apr 2026",
          "points": [
            "Mentored 25,000+ students in MERN, DSA (C++/Python), ML and React Native.",
            "Led real-world ML projects end to end: employee retention, food delivery time prediction and global pollution analysis."
          ]
        }
      ]
    }
  ],
  "PROJECTS": [
    {
      "title": "Developer portfolio",
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/AnkitDimri4/Portfolio"
        },
        {
          "label": "Live",
          "href": "https://portfolio-nine-orcin-33.vercel.app/"
        },
        {
          "label": "Brain map",
          "href": "https://portfolio-nine-orcin-33.vercel.app/brain-map/"
        }
      ],
      "summary": "Pre-rendered React site and Node.js API, with live GitHub and LeetCode stats.",
      "points": [
        "Free [resume builder](https://portfolio-nine-orcin-33.vercel.app/resume-builder/): 3 templates, ATS check, PDF by email and Google sign-in.",
        "Scheduler books Google Meet calls into Google Calendar; 200+ tests run in CI."
      ],
      "tech": "React, Vite, Node.js, Express, PostgreSQL (Neon), Google Calendar & Gmail APIs, GitHub Actions"
    },
    {
      "title": "AI-first HCP CRM — LangGraph + FastAPI",
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/AnkitDimri4/ai-first-hcp-interaction-crm"
        },
        {
          "label": "Live",
          "href": "https://ai-first-hcp-interaction-crm.vercel.app/"
        }
      ],
      "summary": "Field reps log doctor visits in plain English, and an AI agent fills in the CRM.",
      "points": [
        "LangGraph agent with 5 tools (log, edit, follow-up, materials, history) on Groq.",
        "Pulls 8 fields into PostgreSQL via SQLAlchemy; edits change only the fields named."
      ],
      "tech": "FastAPI, LangGraph, Groq LLM, PostgreSQL, SQLAlchemy, React, Redux Toolkit"
    },
    {
      "title": "RN-Wallet — ML expense tracker",
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/AnkitDimri4/RN-WALLET"
        }
      ],
      "summary": "React Native expense tracker on an Express + PostgreSQL API, with Clerk sign-in.",
      "points": [
        "FastAPI + scikit-learn service picks each expense's category from its title.",
        "Redis caching and rate limiting; charts for monthly trends and category spending."
      ],
      "tech": "React Native (Expo), Node.js, PostgreSQL (Neon), Redis, Clerk, FastAPI, scikit-learn"
    },
    {
      "title": "QuickCart — MERN e-commerce",
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/AnkitDimri4/quickcart-mern"
        },
        {
          "label": "Live",
          "href": "https://quickcart-mern.vercel.app/"
        }
      ],
      "summary": "MERN store with user and admin roles (JWT cookies), Stripe checkout and Cloudinary.",
      "points": [
        "Admin dashboard for products, orders, users and reviews, with sales charts."
      ],
      "tech": "React, Redux, Material UI, Node.js, Express, MongoDB, Stripe, Cloudinary, Chart.js"
    },
    {
      "title": "Real-time Todo — Expo × Convex",
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/AnkitDimri4/TODO-RN"
        }
      ],
      "summary": "Edits sync instantly across devices, with progress tracking and dark mode.",
      "tech": "React Native (Expo Router), TypeScript, Convex"
    },
    {
      "title": "Neural network from scratch",
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/AnkitDimri4/DataScience_Project"
        }
      ],
      "summary": "30–5–3 NumPy network trained with backpropagation: 95.67% accuracy on A–C.",
      "tech": "Python, NumPy"
    }
  ],
  "GITHUB": {
    "text": "GitHub: 1,900+ contributions in the last year (1,299 at FileSure, private) and 1,050+ commits across my own projects, summed up on my [brain map](https://portfolio-nine-orcin-33.vercel.app/brain-map/)."
  },
  "PROBLEM_SOLVING": {
    "text": "690+ LeetCode problems solved (380+ medium, 125+ hard) and 590+ commits of [daily-challenge solutions](https://github.com/AnkitDimri4/LeetCode2024-25DCC)."
  },
  "EDUCATION": [
    {
      "degree": "Bachelor of Arts (B.A.)",
      "school": "Shri Dev Suman (PG) College"
    }
  ],
  "SKILLS": [
    [
      "Mobile",
      "React Native (Expo, EAS), iOS, Android, App Store & Google Play releases, Firebase"
    ],
    [
      "Frontend",
      "React, Next.js, Redux, HTML, CSS, Tailwind CSS"
    ],
    [
      "Backend",
      "Node.js, Express, FastAPI, Django, Flask, REST APIs, JWT"
    ],
    [
      "Databases",
      "MongoDB, PostgreSQL, ClickHouse, Redis"
    ],
    [
      "Cloud & DevOps",
      "GCP, AWS, Cloudflare, NetBird, Docker, Kubernetes, Jenkins CI/CD, Sentry, Mixpanel, Vercel, Render"
    ],
    [
      "Programming",
      "Python, JavaScript, TypeScript, C++"
    ],
    [
      "Machine Learning",
      "NumPy, Pandas, scikit-learn, NLP"
    ],
    [
      "Tools",
      "Git, GitHub, Postman, VS Code, Cursor, Claude Code"
    ]
  ],
  "LANGUAGES": "English, Hindi",
  "CERTIFICATIONS": [
    "Tutedude: MERN, Data Science, ML, React Native, DSA, Python, C++ · [view all](https://portfolio-nine-orcin-33.vercel.app/#certificates)",
    "freeCodeCamp: [Responsive Web Design](https://www.freecodecamp.org/certification/ankitdimri/responsive-web-design) (300 hrs)",
    "HackerRank: [Python (Basic)](https://www.hackerrank.com/certificates/298d6262809d)"
  ]
};
