const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, include: [Category] }).then(restaurants => {
      callback(restaurants);
    })
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: Category })
      .then(restaurant => {
        callback(restaurant);
      });
  },
}
module.exports = adminService