const db = require("../../models");
const Restaurant = db.Restaurant;
const Category = db.Category;
const adminService = require("../../services/adminService");
const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.json(data);
    });
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.json(data);
    });
  },
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      return res.json(data);
    });
  },
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      return res.json(data);
    });
  },
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      return res.json(data);
    });
  },
  createRestaurant: (req, res) => {
    adminService.createRestaurant(req, res, (data) => {
      return res.json(data);
    });
  },
  editRestaurant: (req, res) => {
    adminService.editRestaurant(req, res, (data) => {
      return res.json(data);
    })
  },
  getUsers: (req, res) => {
    adminService.getUser(req, res, (data) => {
      return res.json(data);
    })
  },
  toggleAdmin: (req, res) => {
    adminService.toggleAdmin(req, res, (data) => {
      return res.json(data);
    })
  },
};
module.exports = adminController;
