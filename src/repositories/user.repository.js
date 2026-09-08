const User = require("../models/User");

class UserRepository {
  /**
   * Counts the total number of users in the database.
   * @returns {Promise<number>}
   */
  async countUsers() {
    return User.countDocuments();
  }

  /**
   * Creates a new user.
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    return User.create(userData);
  }

  /**
   * Finds a user by email.
   * @param {string} email 
   * @param {boolean} selectPassword - Whether to select the password field
   * @returns {Promise<Object|null>}
   */
  async findUserByEmail(email, selectPassword = false) {
    let query = User.findOne({ email });
    if (selectPassword) {
      query = query.select("+password");
    }
    return query.exec();
  }

  /**
   * Finds a user by ID.
   * @param {string} id 
   * @param {string} selectFields - Additional fields to select (optional)
   * @returns {Promise<Object|null>}
   */
  async findUserById(id, selectFields = "") {
    let query = User.findById(id);
    if (selectFields) {
      query = query.select(selectFields);
    }
    return query.exec();
  }

  /**
   * Updates the refresh token in the database.
   * @param {string} id 
   * @param {string} token 
   * @returns {Promise<Object|null>}
   */
  async updateRefreshToken(id, token) {
    return User.findByIdAndUpdate(
      id,
      { refreshToken: token },
      { new: true }
    ).exec();
  }

  /**
   * Clears the refresh token from the database.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async removeRefreshToken(id) {
    return User.findByIdAndUpdate(
      id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    ).exec();
  }
}

module.exports = new UserRepository();
