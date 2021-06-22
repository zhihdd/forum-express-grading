"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "image", {
      type: Sequelize.STRING,
      defaultValue: "/public/image/profile.jpg",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "image");
  },
};
