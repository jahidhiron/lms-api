// custom module
const User = require("./auth/Model");
const Profile = require("./profile/Model");
const Category = require("./category/Model");
const SubCategory = require("./subCategory/Model");
const Rating = require("./rating/Model");
const File = require("./file/Model");
const Course = require("./course/Model");
const Lecture = require("./lecture/Model");
const Announcement = require("./announcement/Model");
const Note = require("./note/Model");
const Quiz = require("./quiz/Model");
const Assignment = require("./assignment/Model");
const AssignmentAnswer = require("./assignmentAnswer/Model");
const QuizAnswer = require("./quizAnswer/Model");
const Review = require("./review/Model");
const Wishlist = require("./wishlist/Model");
const AddToCard = require("./addToCard/Model");
const Enrollment = require("./enrollment/Model");
const Payment = require("./payment/Model");
const Conversation = require("./chat/conversation/Model");
const Message = require("./chat/message/Model");
const QAndA = require("./qAndA/Model");
const Log = require("./log/Model");

// combined exports
module.exports = {
  User,
  Profile,
  Category,
  SubCategory,
  File,
  Course,
  Lecture,
  Announcement,
  Note,
  Quiz,
  Assignment,
  AssignmentAnswer,
  QuizAnswer,
  Rating,
  Review,
  Wishlist,
  AddToCard,
  Enrollment,
  Payment,
  Conversation,
  Message,
  QAndA,
  Log,
};
