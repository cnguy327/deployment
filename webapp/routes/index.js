var express = require("express");
var router = express.Router();
var path = require("path");

var Item = require("../models/item");
var Patron = require("../models/patron");
var ItemStatus = require("../models/itemStatus");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

router.post("/ajax/validateCard", async function (req, res) {
  const cardNumber = req.body.cardNumber;
  try {
    const patron = await Patron.findOne({ cardNumber: cardNumber });
    if (patron) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Card number not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

router.get("/ajax/itemInfo", async function (req, res) {
  const itemId = req.query.ItemID;
  try {
    const item = await Item.findOneByItemId(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const itemStatus = await ItemStatus.findLatestStatusByItemId(itemId);
    return res.status(200).json({
      title: item.title,
      author: item.author,
      status: itemStatus.status,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.post("/ajax/checkoutItems", async function (req, res) {
  const cardNumber = req.body.cardNumber;
  const itemIds = req.body.itemIds;
  if (itemIds.length > 3) {
    res
      .status(400)
      .json({ success: false, message: "Cannot checkout more than 3 items" });
    return;
  }
  const patron = await Patron.findOne({ cardNumber: cardNumber });
  if (!patron) {
    res.status(404).json({ success: false, message: "Card number not found" });
    return;
  }
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  for (const itemId of itemIds) {
    const itemStatus = new ItemStatus(
      itemId,
      new Date(),
      "C",
      patron._id,
      dueDate
    );
    
    await itemStatus.save();
  }
  res.status(200).json({ success: true });
});


module.exports = router;
