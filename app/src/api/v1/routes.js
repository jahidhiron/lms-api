// custom module
const auth = require("./auth");
const profile = require("./profile");
const category = require("./category");
const subCategory = require("./subCategory");
const file = require("./file");
const course = require("./course");
const lecture = require("./lecture");
const announcement = require("./announcement");
const note = require("./note");
const quiz = require("./quiz");
const assignment = require("./assignment");
const assignmentAnswer = require("./assignmentAnswer");
const quizAnswer = require("./quizAnswer");
const rating = require("./rating");
const review = require("./review");
const wishlist = require("./wishlist");
const addtocard = require("./addToCard");
const enrollment = require("./enrollment");
const payment = require("./payment");
const chat = require("./chat");
const qAndA = require("./qAndA");

// export routing
module.exports = [
  {
    path: "auth",
    module: auth,
  },
  {
    path: "profiles",
    module: profile,
  },
  {
    path: "categories",
    module: category,
  },
  {
    path: "sub-categories",
    module: subCategory,
  },
  {
    path: "files",
    module: file,
  },
  {
    path: "courses",
    module: course,
  },
  {
    path: "lectures",
    module: lecture,
  },
  {
    path: "announcements",
    module: announcement,
  },
  {
    path: "notes",
    module: note,
  },
  {
    path: "quizs",
    module: quiz,
  },
  {
    path: "assignments",
    module: assignment,
  },
  {
    path: "assignment-answers",
    module: assignmentAnswer,
  },
  {
    path: "ratings",
    module: rating,
  },
  {
    path: "reviews",
    module: review,
  },
  {
    path: "wishlists",
    module: wishlist,
  },
  {
    path: "add-to-cart",
    module: addtocard,
  },
  {
    path: "quiz-answer",
    module: quizAnswer,
  },
  {
    path: "enrollments",
    module: enrollment,
  },
  {
    path: "payments",
    module: payment,
  },
  {
    path: "chats",
    module: chat,
  },
  {
    path: "qas",
    module: qAndA,
  },
];
