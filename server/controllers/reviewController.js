const Review = require('../models/Review');

exports.getReviews = async (req, res) => {
  try {
    const filter = {};
    if(req.params.id) {
        filter.targetId = req.params.id;
    }
    const reviews = await Review.find(filter).populate('authorId', 'name');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    req.body.authorId = req.user.id;
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
