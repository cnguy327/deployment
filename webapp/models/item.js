"use strict";

var db = require("../config/db");

function Item(
  id,
  callNo,
  author,
  title,
  pubInfo,
  descript,
  series,
  addAuthor,
  updateCount
) {
  this.id = id;
  this.callNo = callNo;
  this.author = author;
  this.title = title;
  this.pubInfo = pubInfo;
  this.descript = descript;
  this.series = series;
  this.addAuthor = addAuthor;
  this.updateCount = updateCount;
}

/* Searches the items table for the top 10 titles matching the provided query and offset*/
Item.search = function (query, offset, callback) {
  db.pool.getConnection(function (err, connection) {
    connection.query(
      "SELECT * FROM items WHERE title LIKE ? ORDER BY title LIMIT 10 OFFSET ?;",
      [`%${query}%`, Number(offset)],
      function (err, data) {
        connection.release();
        if (err) return callback(err);

        if (data) {
          var results = [];
          for (var i = 0; i < data.length; ++i) {
            var item = data[i];
            results.push(
              new Item(
                item.ID,
                item.CALLNO,
                item.AUTHOR,
                item.TITLE,
                item.PUB_INFO,
                item.DESCRIPT,
                item.SERIES,
                item.ADD_AUTHOR,
                item.UPDATE_COUNT
              )
            );
          }
          callback(null, results);
        } else {
          callback(null, null);
        }
      }
    );
  });
};

/* Counts the number of titles in the items table matching the provided query */
Item.countMatches = function (query, callback) {
  db.pool.getConnection(function (err, connection) {
    connection.query(
      "SELECT COUNT(*) FROM items WHERE title LIKE ?;",
      [`%${query}%`],
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

/* Retrieves the book details of the provided book ID */
Item.retrieve = function (id, callback) {
  db.pool.getConnection(function (err, connection) {
    connection.query(
      "SELECT * FROM items WHERE ID = ?;",
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

module.exports = Item;
