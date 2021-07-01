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
    adminService.createRestaurant(req, res, (data) => {
      return res.render("admin/create", data);
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
    adminService.editRestaurant(req, res, (data) => {
      return res.render("admin/create", data);
    })
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
    adminService.getUser(req, res, (data) => {
      res.render("admin/restaurants", data);
    })
  },

  toggleAdmin: (req, res) => {
    adminService.toggleAdmin(req, res, (data) => {
      res.redirect("/admin/users", data);
    })
  },
};

module.exports = adminController;
