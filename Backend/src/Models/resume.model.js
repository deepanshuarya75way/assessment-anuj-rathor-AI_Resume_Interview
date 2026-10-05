const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true // ✅ PERFORMANCE FIX
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    lowercase: true,
    trim: true
  },

   phone: {
      type: String,
      trim: true
    },
   linkedin: {
      type: String,
      trim: true
    },

    github: {
      type: String,
      trim: true
    },

    summary: {
      type: String,
      default: ""
    },

  skills: {
    type: [String],
    default: []
  },

   projects: [
      {
        title: {
          type: String,
          trim: true
        },

        description: {
          type: String,
          trim: true
        },

        techStack: {
          type: [String],
          default: []
        },

        github: String,
        liveLink: String
      }
    ],

 
    experience: [
      {
        company: {
          type: String,
          trim: true
        },

        role: {
          type: String,
          trim: true
        },

        duration: {
          type: String,
          trim: true
        },

        points: {
          type: [String],
          default: []
        }
      }
    ],

    education: [
      {
        institute: {
          type: String,
          trim: true
        },

        degree: {
          type: String,
          trim: true
        },

        year: {
          type: String,
          trim: true
        }
      }
    ],
  // ✅ ATS FEATURES
    atsScore: {
      type: Number,
      default: 0
    },

    jobTarget: {
      type: String,
      default: ""
    },

    lastAnalyzedAt: {
      type: Date
    },

    // ✅ TEMPLATE + DESIGN
    template: {
      type: String,
      default: "modern"
    },

    theme: {
      type: String,
      default: "light"
    },

    fontScale: {
      type: Number,
      default: 1
    },

    customizations: {
      accentColor: {
        type: String,
        default: "#2563eb"
      },

      fontFamily: {
        type: String,
        default: "Inter"
      },

      spacing: {
        type: Number,
        default: 1
      }
    },

    // ✅ PUBLIC SHARING
    shareId: {
      type: String,
      unique: true,
      sparse: true
    },

    public: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Resume", resumeSchema);