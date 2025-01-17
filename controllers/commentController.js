const commentService = require("../services/commentService");

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      res.redirect(`/restaurants/${req.body.restaurantId}`);
    });
  },

  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      res.redirect("back");
    });
  },
};

module.exports = commentController;
