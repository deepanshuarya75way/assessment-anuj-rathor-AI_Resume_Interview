const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  type:{
    type:String,
      enum: ["tab_switch", "no_face", "multi_face", "silence", "camera_off"],
      requied:true
  }, timestamp: {
    type: Date,
    default: Date.now
  }, 
  severity:{
    type:Number,
    default:0
  }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true  
  },
  mode:{
    type:String,
    enum: ["real", "practice"],
    required:true
  },
   // 🎥 CAMERA + ACCESS CONTROL
  cameraEnabled: {
    type: Boolean,
    default: true
  },
  interviewMode: {
    type: String,
    enum: ["video", "audio", "text"],
    default: "video"
  },
 // 🧠 MAIN INTERVIEW HISTORY
  history: [
    {
      question: String,
      answer: String,

      feedback: {
        clarity: Number,
        confidence: Number,
        technical: Number,
        strengths: [String],
        improvements: [String]
      },

      emotion: {
        confidenceLevel: String,
        stressLevel: String
      },
        score: Number,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
    // 🔥 TRUST SYSTEM (CORE FEATURE)
  trustScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  warnings:{
    type:Number,
    default:0
  },
  violations: [violationSchema],

  // session state
  status:{
    type:String,
    enum: ["active", "completed", "terminated"],
    default: "active"
  },
  terminationReason: {
    type: String,
    default: null
  },
  // 📊 FINAL SCORE
  score: {
    type: Number,
    default: 0
  }
},{timestamps:true});


module.exports = mongoose.model("InterviewSession", sessionSchema);