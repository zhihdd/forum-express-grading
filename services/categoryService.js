const db = require("../models");
const Category = db.Category;

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({ raw: true, nest: true }).then((categories) => {
      if (req.params.id) {
        const category = categories.find((item) => item.id === +req.params.id);
        return res.render("admin/categories", { categories, category });
      }
      return callback(categories);
    });
  },
};
module.exports = categoryService;
