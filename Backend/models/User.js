const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "User" },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["ADMIN", "INTERN"], default: "INTERN" },
  
  isActive: {                // ✅ ADD THIS LINE
    type: Boolean,
    default: true
  },

  avatar: { type: String },
  joinDate: { type: Date, default: Date.now },
  batch: { type: String },
  team: { type: String }
}, { timestamps: true });

UserSchema.methods.comparePassword = function(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// make id visible and remove sensitive fields
UserSchema.set("toJSON", {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.password) delete ret.password;
  }
});

module.exports = mongoose.model("User", UserSchema);
