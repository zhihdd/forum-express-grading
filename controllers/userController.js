const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;
const Comment = db.Comment;
const Restaurant = db.Restaurant;
const Favorite = db.Favorite;
const Like = db.Like;
const Followship = db.Followship;
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const userController = {
  signUpPage: (req, res) => {
    return res.render("signup");
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash("error_messages", "兩次密碼輸入不同！");
      return res.redirect("/signup");
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then((user) => {
        if (user) {
          req.flash("error_messages", "信箱重複！");
          return res.redirect("/signup");
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10),
              null
            ),
          }).then((user) => {
            req.flash("success_messages", "成功註冊帳號！");
            return res.redirect("/signin");
          });
        }
      });
    }
  },

  signInPage: (req, res) => {
    return res.render("signin");
  },

  signIn: (req, res) => {
    req.flash("success_messages", "成功登入！");
    res.redirect("/restaurants");
  },

  logout: (req, res) => {
    req.flash("success_messages", "登出成功！");
    req.logout();
    res.redirect("/signin");
  },

  getUser: (req, res) => {
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
      const isUser = (+req.user.id === +req.params.id)? true: false
      //渲染網頁
      res.render("profile", {
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

  editUser: (req, res) => {
    return User.findByPk(req.params.id).then((user) =>
      res.render("editProfile", { user: user.toJSON() })
    );
  },

  putUser: (req, res) => {
    if (+req.params.id !== +req.user.id) {
      req.flash("error_messages", "無權限修改");
      return res.redirect("back");
    }
    if (!req.body.name) {
      req.flash("error_messages", "Name 不可為空白");
      return res.redirect("back");
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
            req.flash("success_messages", "Profile was successfully to update");
            return res.redirect(`/users/${user.id}`);
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
          req.flash("success_messages", "Profile was successfully to update");
          return res.redirect(`/users/${user.id}`);
        });
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId,
    }).then((restaurant) => res.redirect("back"));
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        RestaurantId: req.params.restaurantId,
        UserId: req.user.id,
      },
    }).then((favorite) =>
      favorite.destroy().then((restaurant) => res.redirect("back"))
    );
  },

  addLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      },
      include: [Restaurant],
    }).then((like) => {
      if (like) {
        console.log(like);
        req.flash(
          "error_messages",
          `Already Like Restaurant : : ${like.Restaurant.name}`
        );
        return res.redirect("back");
      }

      return Like.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      }).then(() =>
        Restaurant.findByPk(req.params.restaurantId).then((restaurant) => {
          req.flash(
            "success_messages",
            `Like  Restaurant : ${restaurant.name}<3`
          );
          res.redirect("back");
        })
      );
    });
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      },
      include: [Restaurant],
    }).then((like) =>
      like.destroy().then(() => {
        req.flash(
          "error_messages",
          `Unlike Restaurant : ${like.Restaurant.name}`
        );
        res.redirect("back");
      })
    );
  },

  getTopUser: (req, res) => {
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
      return res.render("topUser", { users: users });
    });
  },

  addFollowing: (req, res) => {
    if (req.user.id === +req.params.userId){
      req.flash("error_messages","不能追蹤自己R")
      return  res.redirect("back");
    }
      return Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId,
      }).then((followship) => {
        return res.redirect("back");
      });
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId,
      },
    }).then((followship) => {
      followship.destroy().then((followship) => {
        return res.redirect("back");
      });
    });
  },
};

module.exports = userController;
