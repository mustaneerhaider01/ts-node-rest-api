const sql = require("better-sqlite3");
const db = sql("posts.db");

const dummyPosts = [
  {
    title: "Global Economy Sees Recovery",
    content:
      "The global economy is showing signs of recovery after a year of challenges due to the pandemic.",
    createdAt: "2024-06-01T08:30:00Z",
  },
  {
    title: "Climate Change Summit Held in Paris",
    content:
      "World leaders gathered in Paris to discuss the urgent need for action on climate change.",
    createdAt: "2024-06-02T09:00:00Z",
  },
  {
    title: "Tech Innovations in 2024",
    content:
      "Tech companies have unveiled groundbreaking innovations at the annual tech conference.",
    createdAt: "2024-06-03T10:15:00Z",
  },
  {
    title: "Global Stock Markets Rally",
    content:
      "Stock markets around the world have rallied, showing investor confidence in the economic recovery.",
    createdAt: "2024-06-04T11:45:00Z",
  },
  {
    title: "New Space Exploration Mission Announced",
    content:
      "A new space exploration mission to Mars has been announced by international space agencies.",
    createdAt: "2024-06-05T12:00:00Z",
  },
  {
    title: "Healthcare Advances in 2024",
    content:
      "Significant advances in healthcare technologies have been made, promising better patient outcomes.",
    createdAt: "2024-06-06T13:30:00Z",
  },
  {
    title: "Renewable Energy Projects Gain Momentum",
    content:
      "Renewable energy projects are gaining momentum as countries aim to reduce carbon emissions.",
    createdAt: "2024-06-07T14:00:00Z",
  },
  {
    title: "International Trade Agreements Signed",
    content:
      "New international trade agreements have been signed to boost economic cooperation.",
    createdAt: "2024-06-08T15:45:00Z",
  },
];

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME NOT NULL
  )
`
).run();

const initData = async () => {
  const stmt = db.prepare(`
      INSERT INTO posts
        (title, content, createdAt)
      VALUES (
        @title,
        @content,
        @createdAt
      )
    `);

  for (const post of dummyPosts) {
    stmt.run(post);
  }
};

initData();
