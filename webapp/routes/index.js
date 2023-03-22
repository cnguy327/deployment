var express = require("express");
var router = express.Router();

var Item = require("../models/item");
var Subject = require("../models/subject");
const Handlebars = require("handlebars");

Handlebars.registerHelper("encodeKeyword", function (keyword) {
  return new Handlebars.SafeString(encodeURI(keyword));
});

/* GET home page for desktop (default). */
router.get("/", function (req, res, next) {
  res.render("index");
});

/* GET home search page for mobile. */
router.get("/mobile_search", (req, res) => {
  res.render("mobile_search");
});

/* GET page with search results for desktop */
router.get("/search", function (req, res, next) {
  performSearch(req, res, false);
});

/* GET page with search results for mobile */
router.get("/mobile_searchresult", function (req, res, next) {
  performSearch(req, res, true);
});

/* GET page with book details for desktop */
router.get("/details", function (req, res, next) {
  getBookDetails(req, res, false);
});

/* GET page with book details for mobile */
router.get("/mobile_details", function (req, res, next) {
  getBookDetails(req, res, true);
});

// Returns a list of books with titles matching the provided query
function performSearch(req, res, isMobile) {
  var query = req.query.search || req.query.txtTitle || "";
  var offset = req.query.startIndex || 0;
  var totalMatches = 0;
  var viewName = isMobile ? "mobile_searchresult" : "index";

  query = query.trim();
  query = query.replace("´", "'");
  query = query.replace("′", "'");
  query = query.replace("’", "'");

  if (query == "") {
    res.render(viewName, {
      errMsg: null,
      results: null,
      keyWord: query,
      resultCount: 0,
      totalPages: 0,
      offset: 0,
      currentPage: 0,
    });
  } else if (/[^a-zA-Z0-9'\s]+/.test(query)) {
    res.render("error", {
      message: "Error: Please supply a valid query.",
    });
  } else {
    Item.countMatches(query, function (err, results) {
      if (err) {
        console.error(err);
      } else {
        totalMatches = results["COUNT(*)"];
      }
    });

    Item.search(query, offset, function (err, results) {
      if (err) {
        console.error(err);
        res.render("error", {
          message: "Error: Please try again.",
        });
      } else if (results.length == 0) {
        res.render("error", {
          message: "No titles found. Please try again with a different query.",
        });
      } else {
        var totalPages = 1;
        if (totalMatches > 10) {
          totalPages = Math.ceil(totalMatches / 10);
        }
        res.render(viewName, {
          errMsg: null,
          results: results,
          keyWord: query,
          resultCount: totalMatches,
          totalPages: totalPages,
          startIndex: offset,
          prevIndex: Number(offset) - 10,
          nextIndex: Number(offset) + 10,
          currentPage: Math.floor(Number(offset) / 10) + 1,
        });
      }
    });
  }
}

// Retrieve a book's details from the database using the provided book ID
function getBookDetails(req, res, isMobile) {
  var bookID = req.query.book_id;
  var bookSubject = null;
  var viewName = isMobile ? "mobile_details" : "details";

  Subject.retrieve(bookID, function (err, results) {
    if (err) {
      console.error(err);
    } else {
      bookSubject = results["Subject"];
      Item.retrieve(bookID, function (err, results) {
        if (err) {
          console.error(err);
        } else {
          res.render(viewName, {
            Title: results.ID,
            Author: results.AUTHOR,
            AdditionalAuthor: results.ADD_AUTHOR,
            CallNumber: results.CALLNO,
            PublicationInfo: results.PUB_INFO,
            Description: results.DESCRIPT,
            Series: results.SERIES,
            SubjectCategories: bookSubject,
          });
        }
      });
    }
  });
}

module.exports = router;
