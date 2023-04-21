"use strict";

var db = require("../config/db");

function ItemStatus(itemId, timeChange, status, patronId, dueDate) {
  this.itemId = itemId;
  this.timeChange = timeChange;
  this.status = status;
  this.patronId = patronId;
  this.dueDate = dueDate;
}

ItemStatus.findOne = function (query) {
  return new Promise((resolve, reject) => {
    db.pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        return;
      }

      connection.query(
        "SELECT * FROM itemstatus WHERE ?",
        query,
        function (err, data) {
          connection.release();
          if (err) {
            reject(err);
            return;
          }

          if (data && data.length > 0) {
            var itemStatusData = data[0];
            var itemStatus = new ItemStatus(
              itemStatusData.ItemID,
              itemStatusData.TimeChange,
              itemStatusData.Status,
              itemStatusData.PatronID,
              itemStatusData.DueDate
            );
            resolve(itemStatus);
          } else {
            resolve(null);
          }
        }
      );
    });
  });
};


ItemStatus.findLatestStatusByItemId = function (ItemID) {
  return new Promise((resolve, reject) => {
    db.pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        return;
      }
      const query = `
      SELECT * FROM itemstatus
      WHERE ItemID = ?
      ORDER BY TimeChange DESC
      LIMIT 1
    `;

      connection.query(query, [ItemID], function (err, data) {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        if (data && data.length > 0) {
          var itemStatusData = data[0];
          var itemStatus = new ItemStatus(
            itemStatusData.ItemID,
            itemStatusData.TimeChange,
            itemStatusData.Status,
            itemStatusData.PatronID,
            itemStatusData.DueDate
          );
          resolve(itemStatus);
        } else {
          resolve(null);
        }
      });
    });
  });
};

ItemStatus.create = function (itemStatusData) {
  return new Promise((resolve, reject) => {
    db.pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        return;
      }

      connection.query(
        "INSERT INTO itemstatus (ItemID, TimeChange, Status, PatronID, DueDate) VALUES (?, ?, ?, ?, ?);",
        [
          itemStatusData.ItemID,
          itemStatusData.TimeChange,
          itemStatusData.Status,
          itemStatusData.PatronID,
          itemStatusData.DueDate,
        ],
        function (err, data) {
          connection.release();
          if (err) {
            reject(err);
            return;
          }

          if (data) {
            resolve(data);
          } else {
            resolve(null);
          }
        }
      );
    });
  });
};

ItemStatus.prototype.save = function (callback) {
  db.pool.getConnection(function (err, connection) {
    connection.query(
      "INSERT INTO itemstatus (ItemID, TimeChange, Status, PatronID, DueDate) VALUES (?, ?, ?, ?, ?);",
      [this.itemId, this.timeChange, this.status, this.patronId, this.dueDate],
      function (err, data) {
        connection.release();
        if (err) return callback(err);

        if (data) {
          callback(null, data);
        } else {
          callback(null, null);
        }
      }
    );
  });
};

module.exports = ItemStatus;
