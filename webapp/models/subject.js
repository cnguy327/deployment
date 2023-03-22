"use strict";

var db = require("../config/db");

function Subject(BookID, Subject) {
  this.BookID = BookID;
  this.Subject = Subject;
}

/* Retrieves the book subject from the booksubjects table containing the provided ID */
Subject.retrieve = function (id, callback) {
  db.pool.getConnection(function (err, connection) {
    connection.query(
      "SELECT * FROM booksubjects WHERE BookID = ?;",
      [Number(id)],
      function (err, data) {
        connection.release();
        if (err) return callback(err);
        if (data) {
          var results = data[0];
          callback(null, results);
        } else {
          callback(null, null);
        }
      }
    );
  });
};

module.exports = Subject;
