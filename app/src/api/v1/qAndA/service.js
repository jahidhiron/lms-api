// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { QAndA, Course } = require("../models");
const { options } = require(".");

// find single document
exports.findOneQAService = async (keyValues, options = {}) => {
  const qa = await QAndA.findOne(keyValues, options);
  return qa;
};

// create new qa
exports.newQAService = async ({ body, _id }) => {
  const lectureId = body.lectureId;
  const courseId = body.courseId;

  const course = await Course.findOne({ _id: courseId, isDelete: false });
  const sections = course.sections;
  let lectureNo = 0;
  let isMatch = false;

  for (const section of sections) {
    for (const lecture of section.items) {
      if (lecture.lectureId && !isMatch) {
        lectureNo++;
        if (String(lecture.lectureId) === String(lectureId)) {
          isMatch = true;
        }
      }
    }
  }

  const newQA = new QAndA({ ...body, lectureNo, updatedBy: _id });
  await newQA.save();

  newQA.isDelete = undefined;
  newQA.__v = undefined;

  return newQA;
};

// update qa
exports.updateQAService = async ({ qa, title, desc, _id }) => {
  qa.title = title ? title : qa.title;
  qa.desc = desc;
  qa.updatedBy = _id;

  // save qa
  await qa.save();

  return qa;
};

// qa vote
exports.qAVoteService = async ({ qa, userId }) => {
  const index = qa.votes.findIndex((vote) => String(vote) === String(userId));
  if (index === -1) {
    qa.votes.push(userId);
  } else {
    const votes = qa.votes.filter((vote) => String(vote) !== String(userId));
    qa.votes = votes;
  }

  // save qa
  await qa.save();

  return { qa, voted: index === -1 };
};

// qa vote
exports.qAReplyVoteService = async ({ qa, userId, replyId }) => {
  const comments = qa.comments;
  const updatedComments = [];

  let replyIdNotFound = true;

  comments.map((item) => {
    if (String(item._id) !== String(replyId)) {
      updatedComments.push(item);
    }
    if (String(item._id) === String(replyId)) {
      let replied = { ...item };
      replyIdNotFound = false;

      const index = item.votes.findIndex(
        (vote) => String(vote) === String(userId)
      );
      if (index === -1) {
        replied = { ...replied, votes: [...item.votes, userId] };
      } else {
        const votes = item.votes.filter(
          (vote) => String(vote) !== String(userId)
        );
        replied = { ...replied, votes };
      }

      updatedComments.push(replied);
    }
  });

  qa.comments = updatedComments;

  // save review
  await qa.save();

  return { replyIdNotFound, updatedQA: qa };
};

// add new reply
exports.addReplyService = async ({ qa, desc, _id }) => {
  qa.comments.push({
    desc,
    updatedBy: _id,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  });

  await qa.save();

  return qa;
};

// update reply
exports.updateReplyService = async ({ qa, desc, _id, replyId }) => {
  const comments = qa.comments;
  const updatedComments = [];

  let replyIdNotFound = true;

  comments.map((item) => {
    if (String(item._id) !== String(replyId)) {
      updatedComments.push(item);
    }
    if (String(item._id) === String(replyId)) {
      if (String(_id) === String(item.updatedBy)) {
        const replied = { ...item, desc };

        replied.updatedBy = _id;
        updatedComments.push(replied);
        replyIdNotFound = false;
      } else {
        updatedComments.push(item);
      }
    }
  });

  qa.comments = updatedComments;

  // save review
  await qa.save();

  return { replyIdNotFound, updatedQA: qa };
};

// delete reply
exports.deleteReplyService = async ({ qa, replyId, _id }) => {
  const comments = qa.comments;
  const updatedComments = [];

  let replyIdNotFound = true;

  comments.map((item) => {
    if (String(item._id) !== String(replyId)) {
      updatedComments.push(item);
    }

    if (String(item._id) === String(replyId)) {
      if (String(_id) === String(item.updatedBy)) {
        replyIdNotFound = false;
      } else {
        updatedComments.push(item);
      }
    }
  });

  qa.comments = updatedComments;

  // save qa
  await qa.save();

  return { replyIdNotFound, qa };
};

// soft delete qa
exports.deleteQAService = async ({ qa, _id }) => {
  qa.isDelete = true;
  qa.deletedAt = new Date().getTime();
  qa.deletedBy = _id;

  // save qa
  await qa.save();
};

// qa list
exports.findQAsService = async (
  keyValues = {},
  { q, page, size, courseId, lectureId, type }
) => {
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;

  let regex = new RegExp(q, "i");

  let query = {
    ...keyValues,
    $or: [{ title: regex }],
  };

  if (courseId) {
    query = { ...query, courseId };
  }

  if (lectureId) {
    query = { ...query, lectureId };
  }

  const qas = await QAndA.find(query)
    .populate({ path: "updatedBy", select: "name avatar role" })
    .populate({
      path: "comments",
      populate: [
        {
          path: "updatedBy",
          select: "name avatar role",
        },
      ],
    })
    .skip((pageNumber - 1) * sizeNumber)
    .limit(sizeNumber);

  const totalDocuments = await QAndA.countDocuments(query);
  const totalPage = Math.ceil(totalDocuments / sizeNumber);

  return {
    qas,
    totalItem: totalDocuments,
    totalPage,
  };
};

// detail qa
exports.findQAService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  const qa = await QAndA.findOne(query)
    .populate({ path: "updatedBy", select: "name avatar role" })
    .populate({ path: "courseId", select: "title slug" })
    .populate({ path: "lectureId", select: "title slug" })
    .populate({
      path: "comments",
      populate: [
        {
          path: "updatedBy",
          select: "name avatar role",
        },
      ],
    });

  let updatedQA = {
    ...qa._doc,
    lectureId: qa.lectureId ? qa.lectureId._id : null,
    lecture: qa.lectureId ? qa.lectureId : null,
    courseId: qa.courseId ? qa.courseId._id : null,
    course: qa.courseId ? qa.courseId : null,
  };

  return updatedQA;
};
