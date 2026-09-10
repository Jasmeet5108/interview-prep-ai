import mongoose, { Schema, models } from "mongoose";

const requirementSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    kind: {
      type: String,
      enum: ["technical", "behavioural", "domain"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["must", "nice"],
      required: true,
    },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    requirement_ids: [{ type: String }],
    category: {
      type: String,
      enum: ["technical", "behavioural", "system-design", "company-fit"],
      required: true,
    },
    prompt: { type: String, required: true },
    answer_outline: { type: String, default: "" },
    difficulty: {
      type: Number,
      min: 1,
      max: 3,
      required: true,
    },

    origin: {
      type: String,
      enum: ["generated", "manual"],
      default: "generated",
    },

    edited: {
      type: Boolean,
      default: false,
    },

    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const flashcardSchema = new Schema(
  {
    id: { type: String, required: true },
    front: { type: String, required: true },
    back: { type: String, default: "" },
    requirement_ids: [{ type: String }],

    origin: {
      type: String,
      enum: ["generated", "manual"],
      default: "generated",
    },

    edited: {
      type: Boolean,
      default: false,
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },

    lastReviewedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const scheduleDaySchema = new Schema(
  {
    day: { type: Number, required: true },
    focus: { type: String, default: "" },
    question_ids: [{ type: String }],
    minutes: { type: Number, required: true },
  },
  { _id: false },
);

const kitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    input: {
      jd: {
        type: String,
        required: true,
      },

      company_url: {
        type: String,
        required: true,
      },

      days: {
        type: Number,
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["pending", "researching", "generating", "completed", "failed"],
      default: "pending",
    },

    progress: {
      step: {
        type: String,
        default: "pending",
      },

      message: {
        type: String,
        default: "",
      },

      percent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    source: {
      company: { type: String, default: "" },
      company_url: { type: String, default: "" },
      role: { type: String, default: "" },
      location: { type: String, default: "" },
      jd_chars: { type: Number, default: 0 },
      researched_at: { type: String, default: "" },
      pages_used: [{ type: String }],
    },

    company_brief: {
      summary: { type: String, default: "" },
      what_they_do: { type: String, default: "" },
      sources: [{ type: String }],
    },

    role: {
      title: { type: String, default: "" },
      seniority: { type: String, default: "" },
      responsibilities: [{ type: String }],
      requirements: [requirementSchema],
    },

    questions: [questionSchema],

    flashcards: [flashcardSchema],

    schedule: {
      days_available: { type: Number, default: 1 },
      days: [scheduleDaySchema],
    },

    coverage: {
      uncovered_requirement_ids: [{ type: String }],
      passes: { type: Number, default: 0 },
    },

    research: {
      pages: [
        {
          url: String,
          title: String,
          type: {
            type: String,
            enum: ["homepage", "about", "careers", "blog", "other"],
          },
          _id: false,
        },
      ],

      interviewSources: [
        {
          url: String,
          title: String,
          snippet: String,
          _id: false,
        },
      ],

      warnings: [{ type: String }],
    },

    failure: {
      code: { type: String, default: null },
      message: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  },
);

kitSchema.index({
  userId: 1,
  createdAt: -1,
});

const Kit = models.Kit || mongoose.model("Kit", kitSchema);

export default Kit;
