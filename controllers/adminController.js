const fs = require("fs");
const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;
const User = db.User;
// const helpers = require('../_helpers');
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const adminService = require("../services/adminService");

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render("admin/restaurants", { restaurants: data });
    });
  },

  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true }).then((categories) => {
      return res.render("admin/create", { categories });
    });
  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data["status"] === "error") {
        req.flash("error_messages", data["message"]);
        return res.redirect("back");
      }
      req.flash("success_messages", data["message"]);
      res.redirect("/admin/restaurants");
    });
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render("admin/restaurant", {
        restaurant: data.toJSON(),
      });
    });
  },

  editRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true,
    }).then((categories) => {
      return Restaurant.findByPk(req.params.id).then((restaurant) => {
        return res.render("admin/create", {
          categories: categories,
          restaurant: restaurant.toJSON(),
        });
      });
    });
  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data["status"] === "error") {
        req.flash("error_messages", data["message"]);
        return res.redirect("back");
      }
      req.flash("success", data["message"]);
      return res.redirect("/admin/restaurants");
    });
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data["status"] === "success") {
        return res.redirect("/admin/restaurants");
      }
    });
  },

  getUsers: (req, res) => {
    User.findAll({ raw: true }).then((users) => {
      res.render("admin/restaurants", { users });
    });
  },

  toggleAdmin: (req, res) => {
    const id = req.params.id;

    User.findOne({
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
        req.flash(
          "success_messages",
          `Change ${user.name} to ${user.isAdmin ? "admin" : "user"}`
        );
        res.redirect("/admin/users");
      })
      .catch((e) => console.log(e));
  },
};

module.exports = adminController;
