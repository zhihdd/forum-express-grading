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

  getRestaurant: (req, res) => {
    const id = req.params.id;
    Restaurant.findByPk(id, { include: Category }).then((restaurant) => {
      return res.render("restaurant", {
        restaurant: restaurant.toJSON(),
      });
    });
  },
};
module.exports = restController;
