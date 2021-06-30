const db = require("../models");
const User = db.User;
const Comment = db.Comment;
const Restaurant = db.Restaurant;
const Favorite = db.Favorite;
const Like = db.Like;
const Followship = db.Followship;
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

let userService = {
  getUser: (req, res, callback) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Restaurant, as: "FavoritedRestaurants" },
        { model: User, as: "Followings" },
        { model: User, as: "Followers" },
        {
          model: Comment,
          include: [Restaurant],
        },
      ],
    }).then((user) => {
      user = user.toJSON();
      //following
      followings = user.Followings;
      //followers
      followers = user.Followers;
      //favoriteRestaurants
      FavoritedRestaurants = user.FavoritedRestaurants;
      //comment
      let comments = user.Comments;
      restaurants = comments
        .filter(
          (comment, i) =>
            comments
              .map((item) => item.RestaurantId)
              .indexOf(comment.RestaurantId) === i
        )
        .map((comment) => comment.Restaurant);
      //add isFollowed
      const isFollowed = req.user.Followings.map((item) => item.id).includes(
        +req.params.id
      );
      //add isUser
      const isUser = +req.user.id === +req.params.id ? true : false;
      //渲染網頁

      callback({
        profile: user,
        restaurants,
        followings,
        followers,
        FavoritedRestaurants,
        isFollowed,
        isUser,
      });
    });
  },
  editUser: (req, res, callback) => {
    return User.findByPk(req.params.id).then((user) =>
      callback({ user: user.toJSON() })
    );
  },
  putUser: (req, res, callback) => {
    if (+req.params.id !== +req.user.id) {
      return callback({ status: "error", message: "無權限修改" });
    }
    if (!req.body.name) {
      return callback({ status: "error", message: "Name 不可為空白" });
    }

    const { file } = req;
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) =>
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image,
            })
          )
          .then((user) => {
            callback({
              status: "success",
              message: "Profile was successfully to update",
            });
          });
      });
    } else {
      return User.findByPk(req.params.id)
        .then((user) =>
          user.update({
            name: req.body.name,
            image: user.image,
          })
        )
        .then((user) => {
          callback({
            status: "success",
            message: "Profile was successfully to update",
          });
        });
    }
  },
  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId,
    }).then((restaurant) => callback({ status: "success", message: "" }));
  },
  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        RestaurantId: req.params.restaurantId,
        UserId: req.user.id,
      },
    }).then((favorite) =>
      favorite
        .destroy()
        .then((restaurant) => callback({ status: "success", message: "" }))
    );
  },
  addLike: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      },
      include: [Restaurant],
    }).then((like) => {
      if (like) {
        return callback({
          status: "error",
          message: `Already Like Restaurant : ${like.Restaurant.name}`,
        });
      }
      return Like.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      }).then(() =>
        Restaurant.findByPk(req.params.restaurantId).then((restaurant) => {
          return callback({
            status: "success",
            message: `Like  Restaurant : ${restaurant.name}<3`,
          });
        })
      );
    });
  },

  removeLike: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      },
      include: [Restaurant],
    }).then((like) =>
      like.destroy().then(() => {
        callback({
          status: "success",
          message: `Unlike Restaurant : ${like.Restaurant.name}`,
        });
      })
    );
  },

  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [{ model: User, as: "Followers" }],
    }).then((users) => {
      users = users.map((user) => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map((item) => item.id).includes(
          user.id
        ),
      }));
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount);
      callback({ users });
    });
  },

  addFollowing: (req, res, callback) => {
    if (req.user.id === +req.params.userId) {
      return callback({ status: "error", message: "不能追蹤自己R" });
    }
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId,
    }).then((followship) => {
      callback({ status: "success", message: "Add following successfully" });
    });
  },

  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId,
      },
    }).then((followship) => {
      followship.destroy().then((followship) => {
        callback({
          status: "success",
          message: "Remove following successfully",
        });
      });
    });
  },
};

module.exports = userService;
