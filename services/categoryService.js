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
  putCategory: (req, res, callback) => {
    const id = req.params.id;
    const name = req.body.name;
    return Category.findByPk(id)
      .then((category) => category.update({ name }))
      .then((category) =>
        callback({
          status: "success",
          message: `更新為 "${category.name}"`,
        })
      )
      .catch((error) => callback({ status: "Error", message: error }));
  },
  deleteCategory: (req, res, callback) => {
    const id = req.params.id;
    return Category.findByPk(id)
      .then((category) => category.destroy())
      .then((category) =>
        callback({
          status: "success",
          message: `刪除 "${category.name}" 成功`,
        })
      )
      .catch((error) => callback({ status: "Error", message: error }));
  },
};
module.exports = categoryService;
