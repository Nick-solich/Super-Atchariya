const Booking = require("../models/Booking");
const Company = require("../models/Company");

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Private
exports.getBookings = async (req, res, next) => {
  let query;
  //General users can only see their own bookings!
  if (req.user.role !== "admin") {
    query = Booking.find({ user: req.user.id }).populate({
      path: "company",
      select: "name province tel",
    });
  } else {
    query = Booking.find().populate({
      path: "booking",
      select: "name province tel",
    });
  }
  try {
    const bookings = await query;
    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Public
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "company",
      select: "name description tel",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc     Add a booking
//@route    POST /api/v1/companies/:companyId/bookings
//@access   Private
exports.addBooking = async (req, res, next) => {
  try {
    req.body.company = req.params.companyId;
    const company = await Company.findById(req.params.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `No company with the id of ${req.params.companyId}`,
      });
    }
    // console.log(req.body);
    //add user to req.body
    req.body.user = req.user.id;
    //Check for existing booking
    const existingBooking = await Booking.find({ user: req.user.id });
    //If the user is not an admin,they can only create 3 booking.
    if (existingBooking.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 bookings`,
      });
    }
    console.log(req.body);
    const booking = await Booking.create(req.body);
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot add Booking" });
  }
};

//@desc     Update single bookings
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: `No bk with id ${req.params.id}` });
    }

    //Make sure user is booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Booking" });
  }
};

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: `No bk with id ${req.params.id}` });
    }

    //Make sure user is booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Booking" });
  }
};
