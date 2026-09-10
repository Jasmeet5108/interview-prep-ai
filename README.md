# Interview Prep Kit

An AI-powered interview preparation application that transforms a job description and company URL into a structured, personalised interview preparation kit.

The application extracts role requirements, researches the company and its hiring context, generates targeted interview questions, verifies coverage of must-have requirements, creates flashcards, and builds a deterministic study schedule based on the number of days available.

Users can save and edit their kits, regenerate individual question categories without losing manual changes, and practise using confidence-tracked flashcards.

---

## Features

### AI Interview Kit Generation

Provide:

- A job description
- Company website URL
- Number of preparation days

The application generates:

- Structured role requirements
- Company research and hiring context
- Technical questions
- Behavioural questions
- System design questions
- Company-fit questions
- Answer outlines
- Requirement coverage
- Flashcards
- A day-by-day study schedule

### Company Research

The application crawls relevant pages from the supplied company website rather than relying on predefined URL paths.

Links are ranked and followed within configured limits to discover useful pages such as:

- Company information
- Culture and values
- Careers
- Hiring processes
- Interview guidance

Public interview discussions are also searched separately and used as additional hiring context when available.

### Requirement Coverage

Each generated interview question can reference one or more extracted requirements.

A deterministic coverage pass verifies that all must-have requirements are represented.

If gaps remain, a second generation pass creates additional questions specifically targeting the uncovered requirements.

### Interview Kit Builder

Generated kits remain editable after creation.

Users can:

- Edit questions
- Add manual questions
- Delete questions
- Reorder questions
- Pin important questions
- Regenerate individual question categories

Category regeneration preserves:

- Manually created questions
- Edited questions
- Pinned questions
- Questions belonging to other categories

### Practice Mode

Flashcards can be reviewed one at a time.

Users reveal the answer and rate their confidence as:

- Low
- Medium
- High

Confidence is persisted and lower-confidence cards are prioritised in future practice sessions.

### Authentication & Persistence

The application includes email/password authentication using secure HTTP-only session cookies.

Interview kits and practice progress are stored in MongoDB and scoped to the authenticated user.

---

## Tech Stack

### Application

- Next.js 16
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js Route Handlers
- MongoDB
- Mongoose
- Zod

### Authentication

- bcryptjs
- jose / JWT
- HTTP-only cookies

### AI & Research

- Groq API
- Tavily Search API
- Cheerio
- Custom bounded company-site crawler

### Testing

- Vitest

---

## Project Structure

```text
app/
├── api/
│   ├── auth/
│   └── kits/
├── kits/
│   └── [id]/
│       └── practice/
├── login/
└── register/

components/
lib/
├── ai/
├── auth/
├── coverage/
├── generation/
├── pipeline/
├── research/
├── retrieval/
├── schedule/
└── validation/

models/
scripts/
types/
fixtures/
```

The application uses a full-stack Next.js architecture. UI pages and API route handlers live in the same application while generation, crawling, validation, coverage and scheduling logic are kept in separate modules.

---

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd interview-prep-kit
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

On Windows, you can create `.env.local` manually from `.env.example`.

Configure:

```env
MONGODB_URI=
JWT_SECRET=
GROQ_API_KEY=
TAVILY_API_KEY=
```

### 4. Start the development server

```bash
npm run dev
```

Open the local application in your browser.

---

## Environment Variables

| Variable         | Purpose                                                    |
| ---------------- | ---------------------------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string used for application persistence |
| `JWT_SECRET`     | Secret used to sign authentication session tokens          |
| `GROQ_API_KEY`   | Used for structured AI extraction and content generation   |
| `TAVILY_API_KEY` | Used to discover public interview and hiring discussions   |

Never commit `.env.local` or production credentials to the repository.

---

## Available Commands

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Tests

```bash
npm test
```

### Evaluator

```bash
npm run evaluate -- --input fixtures/sample-input.json --output out
```

---

## Evaluator

The project includes a CLI evaluator that runs the interview-kit generation pipeline without requiring the browser UI.

Example:

```bash
npm run evaluate -- --input fixtures/sample-input.json --output out
```

The evaluator:

1. Reads the provided input.
2. Extracts structured role requirements.
3. Researches the supplied company.
4. Generates interview questions.
5. Runs requirement coverage checks.
6. Generates flashcards.
7. Builds the study schedule.
8. Validates the final output schema.
9. Writes the generated result to the requested output directory.

The evaluator supports both a single input object and an array of input objects.

---

## Generation Pipeline

The main generation flow is:

```text
Job Description + Company URL
              │
              ▼
     Requirement Extraction
              │
              ▼
       Company Crawling
              │
              ├── First-party company pages
              │
              └── Public interview research
              │
              ▼
       Question Generation
              │
              ▼
     Deterministic Coverage
              │
              ├── Complete ──────────────┐
              │                          │
              └── Missing requirements  │
                         │               │
                         ▼               │
                 Gap Generation         │
                         │               │
                         └───────────────┤
                                         ▼
                                Flashcard Generation
                                         │
                                         ▼
                               Deterministic Schedule
                                         │
                                         ▼
                                  Schema Validation
                                         │
                                         ▼
                                  Persisted Kit
```

---

## Company Crawling

Company research uses a bounded crawler.

Rather than assuming paths such as `/careers` or `/about`, the crawler:

1. Fetches the supplied company URL.
2. Extracts internal links.
3. Ranks links based on their likely relevance.
4. Visits the highest-value pages within the configured crawl limit.
5. Extracts useful text for research.

The crawler includes:

- Request timeouts
- Content-size limits
- HTML-only processing
- Crawl delays
- `robots.txt` handling
- URL validation
- Private/loopback address blocking in production

Local addresses remain usable outside production so that the evaluator can work with local test servers when required.

---

## Coverage Strategy

Coverage is intentionally deterministic rather than relying on the language model to decide whether the generated kit is complete.

Each requirement receives a stable ID.

Generated questions reference those IDs through `requirement_ids`.

After initial question generation:

```text
must-have requirements
        ↓
question requirement_ids
        ↓
coverage comparison
        ↓
missing IDs?
   ↙           ↘
 yes            no
 ↓               ↓
gap pass       complete
```

If a must-have requirement remains uncovered, the pipeline performs a targeted second generation pass.

---

## Study Schedule

The study schedule is generated deterministically from:

- Requirement priority
- Question difficulty
- Available preparation days

Higher-priority and more difficult preparation is placed earlier in the schedule.

The resulting schedule always contains exactly the requested number of preparation days.

---

## Security & Robustness

The project includes several safeguards:

- Password hashing with bcrypt
- Signed JWT sessions
- HTTP-only authentication cookies
- SameSite cookie protection
- Secure cookies in production
- User-level ownership checks for interview kits
- Zod input/output validation
- URL protocol validation
- Private and loopback network blocking in production
- `robots.txt` support
- Crawl request timeouts
- Page-size limits
- Bounded crawling
- Graceful handling of unavailable research sources

API keys and secrets are provided only through environment variables.

---

## Testing

The project includes automated tests covering important deterministic behaviour including:

- Requirement coverage
- Second-pass coverage gap generation
- Question preservation during category regeneration
- Deterministic schedule generation
- Final interview-kit schema validation

Run:

```bash
npm test
```

Current test suite:

```text
Test Files  5 passed
Tests       19 passed
```

---

## Design Decisions

### Full-stack Next.js

Next.js Route Handlers allow the UI and backend API to remain in one deployable application while business logic stays separated into reusable modules.

### Deterministic coverage

AI generation is useful for producing interview content, but completeness should not depend solely on an LLM. Requirement IDs allow coverage to be checked programmatically.

### Safe regeneration

Users should be able to customise generated content without having those changes unexpectedly overwritten.

Manual, edited and pinned questions are therefore preserved during category regeneration.

### Bounded research

Company websites can contain thousands of pages. The crawler deliberately prioritises a small number of likely useful pages rather than attempting to crawl an entire domain.

### Deterministic scheduling

The study schedule is generated programmatically so that the requested number of days and prioritisation rules remain predictable.

---

## Limitations & Trade-offs

- AI-generated interview content can vary between runs.
- Public interview information may not exist for smaller companies.
- Some company websites restrict automated crawling or heavily depend on client-side rendering.
- Research is intentionally bounded to keep generation time and API usage reasonable.
- Company research quality depends on the information publicly available on the supplied domain.
- The current application uses a synchronous generation request rather than a background job queue.
- Progress shown during generation represents the generation workflow rather than server-streamed per-stage events.

These trade-offs keep the implementation focused while maintaining predictable behaviour and reasonable free-tier resource usage.

---

## Production Checklist

Before deployment or evaluation:

```bash
npm test
npm run evaluate -- --input fixtures/sample-input.json --output out
npm run build
```

All three should complete successfully.

---

## Author

**Jasmeet Singh**

Full Stack Developer
