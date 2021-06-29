const db = require("../models");
const Category = db.Category;
const categoryService = require("../services/categoryService");

let categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render("admin/categories", { categories: data });
    })
  },

  postCategory: (req, res) => {
    const name = req.body.name.trim();
    if (!name) {
      req.flash("error_messages", "請填寫類別");
      return res.redirect("/admin/categories");
    }
    return Category.findOne({ where: { name } }).then((category) => {
      if (category) {
        req.flash("error_messages", "此類別已存在");
        return res.redirect("/admin/categories");
      }
      return Category.create({
        name,
      })
        .then((category) => {
          req.flash("success_messages", `成功新增 種類:${category.name}`);
          return res.redirect("/admin/categories");
        })
        .catch((error) => console.log("Error", error));
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
