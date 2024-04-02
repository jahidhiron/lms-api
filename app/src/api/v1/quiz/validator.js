const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");
const indexPrefix = require("../utils/indexPrefix");

// add quiz validator
exports.addValidator = [
  check("title").notEmpty().withMessage("Title is required"),

  check("courseId")
    .notEmpty()
    .withMessage("Course id is required")
    .custom(async (courseId) => {
      if (courseId && !ObjectId.isValid(courseId)) {
        throw "Course id not found";
      }
    }),

  check("questions").custom(async (questions) => {
    const tempQuestion = [];

    questions &&
      questions.length > 0 &&
      questions.map((q, j) => {
        if (!q.title) {
          throw `Index ${indexPrefix(j)} question title is required`;
        }

        if (!q.options) {
          throw `Index ${indexPrefix(j)} question option is required`;
        }

        if (!q.answer) {
          throw `Index ${indexPrefix(j)} question answer is required`;
        }

        if (!q.questionType) {
          throw `Index ${indexPrefix(j)} question type is required`;
        }

        if (q.questionType && isNaN(q.questionType)) {
          throw `Index ${indexPrefix(j)} question type is numeric value`;
        }

        if (q.options && q.options.length < 2) {
          throw `Index ${indexPrefix(
            j
          )} question, you need at least two options`;
        }

        if (q.answer && q.answer.length < 1) {
          throw `Index ${indexPrefix(
            j
          )} question at least 1 answer is required`;
        }

        if (q.title && tempQuestion.includes(q.title)) {
          throw `${indexPrefix(j)} question already taken`;
        }

        const tempOption = [];

        q &&
          q.options &&
          q.options.length > 0 &&
          q.options.map((o, i) => {
            if (tempOption.includes(o.option)) {
              throw `Index ${indexPrefix(j)} question, index ${indexPrefix(
                i
              )} option already taken`;
            }

            tempOption.push(o.option);
          });

        tempQuestion.push(q.title);
      });
  }),
];

// update quiz validator
exports.updateValidator = [
  check("courseId").custom(async (courseId) => {
    if (courseId && !ObjectId.isValid(courseId)) {
      throw "Course id not found";
    }
  }),

  check("questions").custom(async (questions) => {
    const tempQuestion = [];

    questions &&
      questions.length > 0 &&
      questions.map((q, j) => {
        if (!q.title) {
          throw `Index ${indexPrefix(j)} question title is required`;
        }

        if (!q.options) {
          throw `Index ${indexPrefix(j)} question option is required`;
        }

        if (!q.answer) {
          throw `Index ${indexPrefix(j)} question answer is required`;
        }

        if (!q.questionType) {
          throw `Index ${indexPrefix(j)} question type is required`;
        }

        if (q.questionType && isNaN(q.questionType)) {
          throw `Index ${indexPrefix(j)} question type is numeric value`;
        }

        if (q.options && q.options.length < 2) {
          throw `Index ${indexPrefix(
            j
          )} question, you need at least two options`;
        }

        if (q.answer && q.answer.length < 1) {
          throw `Index ${indexPrefix(
            j
          )} question at least 1 answer is required`;
        }

        if (q.title && tempQuestion.includes(q.title)) {
          throw `${indexPrefix(j)} question already taken`;
        }

        const tempOption = [];

        q &&
          q.options &&
          q.options.length > 0 &&
          q.options.map((o, i) => {
            if (tempOption.includes(o.option)) {
              throw `Index ${indexPrefix(j)} question, index ${indexPrefix(
                i
              )} option already taken`;
            }

            tempOption.push(o.option);
          });

        tempQuestion.push(q.title);
      });
  }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Quiz id not found";
    }
  }),
];
