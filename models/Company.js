const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    website: {
      type: String,
      required: [true, "Please add a website"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Reverse populate with virtuals
CompanySchema.virtual("bookings", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "company",
  justOne: false,
});

//Cascade delete bookings when a company is deleted
CompanySchema.pre("remove", async function (next) {
  console.log(`Bookings being removed from company ${this._id}`);
  await this.model("Booking").deleteMany({ company: this._id });
  next();
});

module.exports = mongoose.model("Company", CompanySchema);
