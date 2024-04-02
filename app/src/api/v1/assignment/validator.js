const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");
const indexPrefix = require("../utils/indexPrefix");

// add assignment validator
exports.addValidator = [
  check("title").notEmpty().withMessage("Title is required"),

  check("duration").custom(async (duration) => {
    if (duration && isNaN(duration)) {
      throw "Duration is a numeric value";
    }
  }),

  check("instructionVideoId").custom(async (instructionVideoId) => {
    if (instructionVideoId && !ObjectId.isValid(instructionVideoId)) {
      throw "Instruction file id not found";
    }
  }),

  check("instructionFileId").custom(async (instructionFileId) => {
    if (instructionFileId && !ObjectId.isValid(instructionFileId)) {
      throw "Instruction file id not found";
    }
  }),

  check("solutionVideoId").custom(async (solutionVideoId) => {
    if (solutionVideoId && !ObjectId.isValid(solutionVideoId)) {
      throw "Solution file id not found";
    }
  }),

  check("solutionFileId").custom(async (solutionFileId) => {
    if (solutionFileId && !ObjectId.isValid(solutionFileId)) {
      throw "Solution file id not found";
    }
  }),

  check("courseId")
    .notEmpty()
    .withMessage("Course is required")
    .custom(async (courseId) => {
      if (courseId && !ObjectId.isValid(courseId)) {
        throw "Course id not found";
      }
    }),

  check("questions")
    .custom(async (questions) => {
      if (questions && Array.isArray(questions)) {
        for (const [index, question] of questions.entries()) {
          if (!question.title) {
            throw `Index ${indexPrefix(index)} question title is required`;
          }

          if (!question.correctAnswer) {
            throw `Index ${indexPrefix(index)} question answer is required`;
          }
        }
      } else if(questions && !Array.isArray(questions)) {
        throw "Question must be an array";
      }
    }),
];

// update assignment validator
exports.updateValidator = [
  check("duration").custom(async (duration) => {
    if (duration && isNaN(duration)) {
      throw "Duration is a numeric value";
    }
  }),

  check("instructionVideoId").custom(async (instructionVideoId) => {
    if (instructionVideoId && !ObjectId.isValid(instructionVideoId)) {
      throw "Instruction file id not found";
    }
  }),

  check("instructionFileId").custom(async (instructionFileId) => {
    if (instructionFileId && !ObjectId.isValid(instructionFileId)) {
      throw "Instruction file id not found";
    }
  }),

  check("solutionVideoId").custom(async (solutionVideoId) => {
    if (solutionVideoId && !ObjectId.isValid(solutionVideoId)) {
      throw "Solution file id not found";
    }
  }),

  check("solutionFileId").custom(async (solutionFileId) => {
    if (solutionFileId && !ObjectId.isValid(solutionFileId)) {
      throw "Solution file id not found";
    }
  }),

  check("courseId").custom(async (courseId) => {
    if (courseId && !ObjectId.isValid(courseId)) {
      throw "Course id not found";
    }
  }),

  check("questions")
    .custom(async (questions) => {
      if (questions && Array.isArray(questions)) {
        for (const [index, question] of questions.entries()) {
          if (!question.title) {
            throw `Index ${indexPrefix(index)} question title is required`;
          }

          if (!question.correctAnswer) {
            throw `Index ${indexPrefix(index)} question answer is required`;
          }
        }
      } else if(questions && !Array.isArray(questions)) {
        throw "Question must be an array";
      }
    }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Assignment id not found";
    }
  }),
];
