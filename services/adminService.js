const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;
const User = db.User;
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, include: [Category] }).then(
      (restaurants) => {
        callback(restaurants);
      }
    );
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: Category }).then(
      (restaurant) => {
        callback(restaurant);
      }
    );
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id).then((restaurant) => {
      restaurant.destroy().then((restaurant) => {
        callback({
          status: "success",
          message: "",
        });
      });
    });
  },
  postRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: "error", message: "name didn't exist" });
    }
    const { file } = req; // equal to const file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId,
        }).then((restaurant) => {
          callback({
            status: "success",
            message: "restaurant was successfully created",
          });
        });
      });
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        CategoryId: req.body.categoryId,
      }).then((restaurant) => {
        callback({
          status: "success",
          message: "restaurant was successfully created",
        });
      });
    }
  },

  putRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      return callback({
        status: "error",
        message: "name didn't exist",
      });
    }

    const { file } = req;
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id).then((restaurant) => {
          restaurant
            .update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId,
            })
            .then((restaurant) => {
              callback({
                status: "success",
                message: "restaurant was successfully to update",
              });
            });
        });
      });
    } else {
      return Restaurant.findByPk(req.params.id).then((restaurant) => {
        restaurant
          .update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
          })
          .then((restaurant) => {
            callback({
              status: "success",
              message: "restaurant was successfully to update",
            });
          });
      });
    }
  },
  createRestaurant: (req, res, callback) => {
    return Category.findAll({raw:true, nest:true})
    .then(categories => {
      callback(categories)
    })
  },
  editRestaurant: (req, res, callback) => {
   return Category.findAll({
      raw: true,
      nest: true,
    }).then((categories) => {
      return Restaurant.findByPk(req.params.id).then((restaurant) => {
        callback({
          categories: categories,
          restaurant: restaurant.toJSON(),
        });
      });
    });
  },
  getUser: (req, res, callback) => {
    return  User.findAll({ raw: true }).then((users) => {
      callback({ users });
    });
  },
  toggleAdmin: (req, res, callback) => {
    const id = req.params.id;
    return User.findOne({
      where: {
        id,
      },
    })
      .then((user) =>
        user.update({
          isAdmin: user.isAdmin ? false : true,
        })
      )
      .then((user) => {
        callback({ status: "success", message: `Change ${user.name} to ${user.isAdmin ? "admin" : "user"}` })
      })
      .catch((e) => console.log(e));
  },

};
module.exports = adminService;
