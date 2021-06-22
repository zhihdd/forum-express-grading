const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;

const restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ include: [Category] }).then((restaurants) => {
      const data = restaurants.map((item) => ({
        ...item.dataValues,
        description: item.dataValues.description.substring(0, 50),
        categoryName: item.Category.name,
      }));
      return res.render("restaurants", { restaurants: data });
    });
  },
};
module.exports = restController;
