const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "temp/" });
const passport = require("../config/passport");

const adminController = require("../controllers/api/adminController");
const categoryController = require("../controllers/api/categoryController");
const userController = require("../controllers/api/userController");

const authenticated = passport.authenticate("jwt", { session: false });
const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) {
      return next();
    }
    return res.json({ status: "error", message: "permission denied" });
  } else {
    return res.json({ status: "error", message: "permission denied" });
  }
};
//admin
////restaurant
router.get(
  "/admin/restaurants",
  authenticated,
  authenticatedAdmin,
  adminController.getRestaurants
);
router.get(
  "/admin/restaurants/:id",
  authenticated,
  authenticatedAdmin,
  adminController.getRestaurant
);
router.delete(
  "/admin/restaurants/:id",
  authenticated,
  authenticatedAdmin,
  adminController.deleteRestaurant
);
router.post(
  "/admin/restaurants",
  authenticated,
  authenticatedAdmin,
  upload.single("image"),
  adminController.postRestaurant
);
router.put(
  "/admin/restaurants/:id",
  authenticated,
  authenticatedAdmin,
  upload.single("image"),
  adminController.putRestaurant
);
////category
router.get(
  "/admin/categories",
  authenticated,
  authenticatedAdmin,
  categoryController.getCategories
);
router.post(
  "/admin/categories",
  authenticated,
  authenticatedAdmin,
  categoryController.postCategory
);
router.put(
  "/admin/categories/:id",
  authenticated,
  authenticatedAdmin,
  categoryController.putCategory
);
router.delete(
  "/admin/categories/:id",
  authenticated,
  authenticatedAdmin,
  categoryController.deleteCategory
);

//user
router.get("/users/top", authenticated, userController.getTopUser);
router.get("/users/:id", authenticated, userController.getUser);
router.get("/users/:id/edit", authenticated, userController.editUser);
router.put(
  "/users/:id",
  authenticated,
  upload.single("image"),
  userController.putUser
);
router.post("/following/:userId", authenticated, userController.addFollowing);
router.delete(
  "/following/:userId",
  authenticated,
  userController.removeFollowing
);
router.post(
  "/favorite/:restaurantId",
  authenticated,
  userController.addFavorite
);
router.delete(
  "/favorite/:restaurantId",
  authenticated,
  userController.removeFavorite
);

router.post("/like/:restaurantId", authenticated, userController.addLike);
router.delete("/like/:restaurantId", authenticated, userController.removeLike);
router.post("/signin", userController.signIn);
router.post("/signup", userController.signUp);

module.exports = router;
