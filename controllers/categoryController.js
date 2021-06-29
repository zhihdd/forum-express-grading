const db = require("../models");
const Category = db.Category;
const categoryService = require("../services/categoryService");

let categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render("admin/categories", { categories: data });
    });
  },

  postCategory: (req, res) => {
    categoryService.postCategory(req, res, (data) => {
      if (data["status"] === "error") {
        req.flash("error_message", data["message"]);
        return res.redirect("back");
      }
      req.flash("success", data["message"]);
      return res.redirect("/admin/categories");
    });
  },

  putCategory: (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    console.log(id, name);
    return Category.findByPk(id)
      .then((category) => category.update({ name }))
      .then(() => res.redirect("/admin/categories"))
      .catch((error) => console.log("Error", error));
  },

  deleteCategory: (req, res) => {
    const id = req.params.id;
    return Category.findByPk(id)
      .then((category) => category.destroy())
      .then(() => res.redirect("/admin/categories"))
      .catch((error) => console.log("Error", error));
  },
};

module.exports = categoryController;
