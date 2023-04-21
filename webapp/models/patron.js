"use strict";

var db = require("../config/db");

function Patron(id, fullName, phone, cardNumber) {
  this.id = id;
  this.fullName = fullName;
  this.phone = phone;
  this.cardNumber = cardNumber;
}

Patron.findOne = function (conditions) {
  return new Promise((resolve, reject) => {
    db.pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
      }
      connection.query(
        "SELECT * FROM patron WHERE CardNum = ?;",
        [conditions.cardNumber],
        function (err, data) {
          connection.release();
          if (err) reject(err);

          if (data && data.length > 0) {
            var patronData = data[0];
            var patron = new Patron(
              patronData.ID,
              patronData.FullName,
              patronData.Phone,
              patronData.CardNum
            );
            resolve(patron);
          } else {
            resolve(null);
          }
        }
      );
    });
  });
};

module.exports = Patron;
