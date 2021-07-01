const sequelize = require("sequelize");
const { Sequelize } = require("../models");
const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;
const Comment = db.Comment;
const User = db.User;
const pageLimit = 10;

const restController = {
  getRestaurants: (req, res, callback) => {
    let offset = 0;
    const whereQuery = {};
    let categoryId = "";
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit;
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId);
      whereQuery.categoryId = categoryId;
    }
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit,
    }).then((result) => {
      // data for pagination
      const page = Number(req.query.page) || 1;
      const pages = Math.ceil(result.count / pageLimit);
      const totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1
      );
      const prev = page - 1 < 1 ? 1 : page - 1;
      const next = page + 1 > pages ? pages : page + 1;

      // clean up restaurant data
      const data = result.rows.map((r) => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(item => item.id).includes(r.id),
      }));
      Category.findAll({
        raw: true,
        nest: true,
      }).then((categories) => {
        callback({
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next,
        });
      });
    });
  },

  getRestaurant: (req, res, callback) => {
    const id = req.params.id;
    Restaurant.findByPk(id, {
      include: [Category,
        { model: User, as: "FavoritedUsers" },
        { model: User, as: "LikedUsers" },
        { model: Comment, include: [User] }],
    }).then((restaurant) => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id);
      const isLiked = restaurant.LikedUsers.map(item => item.id).includes(req.user.id);
      return restaurant.increment({
        'viewCounts': 1
      }).then(restaurant => {
        callback({
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        });
      })
    });
  },

  getFeeds: (req, res, callback) => {
    return Promise.all([Restaurant.findAll({
      raw: true,
      nest: true,
      limit: 10,
      order: [["createdAt", "DESC"],], include: Category
    }), Comment.findAll({
      raw: true,
      nest: true,
      order: [["createdAt", "DESC"]],
      include: [User, Restaurant]
    })])
      .then(([restaurants, comments]) => {
        callback({ restaurants, comments })
      });
  },

  getDashboard: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category, Comment] })
      .then(restaurant => {
        restaurant = restaurant.toJSON();
        callback({ restaurant });
      });
  },

  getTopRestaurant: (req, res, callback) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      limit: 10,
      attributes: {
        include: [
          [
            sequelize.literal(
              "(select count(*) from Favorites where Favorites.RestaurantId = Restaurant.id)"
            ),
            "FavoritedUserCount",
          ],
        ],
      },
      order: [[sequelize.literal("FavoritedUserCount"), "DESC"]],
    }).then((restaurants) => {
      restaurants.forEach(restaurant => {
        restaurant.isFavorited = req.user.FavoritedRestaurants.map(item => item.id).includes(restaurant.id)
        restaurant.description = restaurant.description.substring(0, 30);
      })
      callback({ restaurants });
    });
  },
};
module.exports = restController;
