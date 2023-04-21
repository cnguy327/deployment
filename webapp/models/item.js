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

Item.findOneByItemId = function (itemId) {
  return new Promise((resolve, reject) => {
    db.pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        return;
      }

      connection.query("SELECT * FROM items WHERE ID = ?", [itemId], function (err, data) {
        connection.release();
        if (err) {
          reject(err);
          return;
        }

        if (data && data.length > 0) {
          var itemData = data[0];
          var item = new Item(itemData.ID, itemData.CALLNO, itemData.AUTHOR, itemData.TITLE, itemData.PUB_INFO, itemData.DESCRIPT, itemData.SERIES, itemData.ADD_AUTHOR, itemData.UPDATE_COUNT);
          resolve(item);
        } else {
          resolve(null);
        }
      });
    });
  });
};

module.exports = Item;
