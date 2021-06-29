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
    categoryService.putCategory(req, res, (data) => {
      if (data["status"] === "error") {
        req.flash("error_message", data["message"]);
        return res.redirect("back");
      }
      req.flash("success_message", data["message"]);
      return res.redirect("/admin/categories");
    });
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
