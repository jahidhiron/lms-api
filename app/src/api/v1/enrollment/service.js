// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Enrollment, Course, Review, Lecture } = require("../models");

// find single document
exports.findOneEnrollmentService = async (keyValues, options = {}) => {
  const enrollment = await Enrollment.findOne(keyValues, options);
  return enrollment;
};

// create new enrollment
exports.newEnrollmentService = async ({ body, _id }) => {
  const newEnrollment = new Enrollment({ ...body, updatedBy: _id });
  await newEnrollment.save();

  newEnrollment.isDelete = undefined;
  newEnrollment.__v = undefined;

  return newEnrollment;
};

// complete lecture
exports.completeLectureService = async ({
  enrollment,
  lectureId,
  role,
  _id,
}) => {
  const complete = enrollment.complete;
  let index = complete.findIndex(
    (item) => String(item.lectureId) === String(lectureId)
  );

  if (index === -1) {
    complete.push({ lectureId, completedAt: new Date().getTime() });
  }

  enrollment.complete = complete;
  if (role === 3) {
    enrollment.updatedBy = _id;
  }

  // save enrollment
  await enrollment.save();

  return enrollment;
};

// soft delete enrollment
exports.deleteEnrollmentService = async ({ enrollment, _id }) => {
  enrollment.isDelete = true;
  enrollment.deletedAt = new Date().getTime();
  enrollment.deletedBy = _id;

  // save enrollment
  await enrollment.save();
};

// enrollment list
exports.findEnrollmentsService = async (
  keyValues = {},
  { q, page, size, _id }
) => {
  let regex = new RegExp(q, "i");
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;

  let query = {
    ...keyValues,
  };

  if (_id) {
    query = { ...query, updatedBy: new ObjectId(_id) };
  }

  const enrollments = await Enrollment.find(query)
    .populate([
      {
        path: "courseId",
        populate: [
          {
            path: "sections.items",
            populate: [
              {
                path: "lectureId",
                populate: [
                  {
                    path: "videoId",
                  },
                ],
              },
            ],
          },
          {
            path: "thumbnailId",
          },
        ],
      },
      {
        path: "updatedBy",
        select: "name email",
      },
    ])
    .skip((pageNumber - 1) * sizeNumber)
    .limit(sizeNumber);

  const udpatedEnrollment = [];

  for (let enrollment of enrollments) {
    let totalLecture = 0;
    let totalLength = 0;

    for (let section of enrollment.courseId.sections) {
      for (let item of section.items) {
        if (item.lectureId) {
          totalLecture++;
          if (item.lectureId.videoId && item.lectureId.videoId.timeLength) {
            totalLength += item.lectureId.videoId.timeLength;
          }
        }
      }
    }

    const reviews = await Review.find({
      courseId: enrollment.courseId,
      isDelete: false,
    });

    let totalRating = 0;

    for (const review of reviews) {
      totalRating += review.rating;
    }

    const averageRating = totalRating
      ? (totalRating / reviews.length).toFixed(2)
      : "0";

    const totalCompleted =
      ((enrollment.complete.length / totalLecture) * 100).toFixed() + "%";

    udpatedEnrollment.push({
      _id: enrollment._id,
      courseId: enrollment.courseId._id,
      complete: enrollment.complete,
      totalCompleted,
      updatedBy: enrollment.updatedBy,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      course: {
        _id: enrollment.courseId._id,
        title: enrollment.courseId.title,
        slug: enrollment.courseId.slug,
        language: enrollment.courseId.language,
        level: enrollment.courseId.level,
        subTitle: enrollment.courseId.subTitle,
        price: enrollment.courseId.price,
        thumbnailId: enrollment.courseId.thumbnailId._id,
        thumbnail: enrollment.courseId.thumbnailId,
        totalLecture,
        totalLength,
      },
      averageRating,
    });
  }

  const totalDocuments = await Enrollment.countDocuments(query);
  const totalPage = Math.ceil(totalDocuments / sizeNumber);

  return {
    enrollments: udpatedEnrollment,
    totalItem: totalDocuments,
    totalPage,
  };
};

// detail enrollment
exports.findEnrollmentService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  const enrollment = await Enrollment.findOne(query).populate([
    {
      path: "courseId",
      populate: [
        {
          path: "sections.items",
          populate: [
            {
              path: "lectureId",
              populate: [
                {
                  path: "videoId",
                },
                {
                  path: "resources.fileId",
                },
                {
                  path: "cations.fileId",
                },
              ],
            },
            {
              path: "quizId",
            },
            {
              path: "assignmentId",
              populate: [
                {
                  path: "instructionVideoId",
                },
                {
                  path: "instructionFileId",
                },
                {
                  path: "solutionVideoId",
                },
                {
                  path: "solutionFileId",
                },
              ],
            },
          ],
        },
        {
          path: "thumbnailId",
        },
        {
          path: "promotionalVideoId",
        },
        {
          path: "categoryId",
        },
        {
          path: "subCategoryId",
        },
        {
          path: "updatedBy",
          select: "name email",
        },
      ],
    },
    {
      path: "updatedBy",
      select: "name email",
    },
  ]);

  if (!enrollment) {
    return null;
  }

  const reviews = await Review.find({
    courseId: enrollment.courseId,
    isDelete: false,
  });

  let totalRating = 0;
  let totalLecture = 0;

  for (const review of reviews) {
    totalRating += review.rating;
  }

  const averageRating = totalRating
    ? (totalRating / reviews.length).toFixed(2)
    : "0";

  let totalVideoLength = 0;
  let totalLength = 0;

  const course = enrollment.courseId;
  if (course) {
    const sections = course.sections;
    for (let section of sections) {
      for (let item of section.items) {
        if (item.lectureId) {
          totalLecture++;
          if (item.lectureId.video && item.lectureId.videoId.timeLength) {
            totalVideoLength += item.lectureId.video.timeLength;
          }
        }
      }
    }
  }

  const updatedCourse = {
    ...course._doc,
    thumbnail: course.thumbnailId ? course.thumbnailId : {},
    thumbnailId:
      course.thumbnailId && course.thumbnailId._id
        ? course.thumbnailId._id
        : null,
    promotionalVideo: course.promotionalVideoId
      ? course.promotionalVideoId
      : {},
    promotionalVideoId:
      course.promotionalVideoId && course.promotionalVideoId._id
        ? course.promotionalVideoId._id
        : null,
    category: course.categoryId,
    categoryId: course.categoryId._id,
    subCategory: course.subCategoryId,
    subCategoryId: course.subCategoryId._id,
    totalLecture,
    totalLength,
  };

  const sections = updatedCourse.sections ? updatedCourse.sections : [];
  const updatedSections = [];

  for (let section of sections) {
    const updatedItems = [];
    if (section.items) {
      for (let item of section.items) {
        const updatedResources = [];
        const updatedCaptions = [];
        if (item.lectureId) {
          if (item.lectureId.resources) {
            for (let resource of item.lectureId.resources) {
              if (resource.fileId) {
                updatedResources.push({
                  fileId: resource.fileId._id,
                  file: {
                    ...resource.fileId._doc,
                  },
                });
              } else {
                updatedResources.push({
                  ...resource._doc,
                });
              }
            }
          }

          if (item.lectureId.cations) {
            for (let cations of item.lectureId.cations) {
              if (cations.fileId) {
                updatedCaptions.push({
                  ...cations._doc,
                  fileId: cations.fileId._id,
                  file: {
                    ...cations.fileId._doc,
                  },
                });
              }
            }
          }

          updatedItems.push({
            lectureId: item.lectureId._doc._id,
            lecture: {
              ...item.lectureId._doc,
              video: item.lectureId._doc.videoId
                ? item.lectureId._doc.videoId
                : {},
              videoId: item.lectureId._doc.videoId
                ? item.lectureId._doc.videoId._id
                : null,
              resources: updatedResources,
              cations: updatedCaptions,
            },
          });
        } else if (item.quizId) {
          updatedItems.push({
            quizId: item.quizId._doc._id,
            quiz: {
              ...item.quizId._doc,
            },
          });
        } else if (item.assignmentId) {
          updatedItems.push({
            assignmentId: item.assignmentId._doc._id,
            instructionVideoId: item.assignmentId._doc.instructionVideoId
              ? item.assignmentId._doc.instructionVideoId._id
              : null,
            instructionVideo: item.assignmentId._doc.instructionVideoId
              ? item.assignmentId._doc.instructionVideoId
              : null,
            instructionFileId: item.assignmentId._doc.instructionFileId
              ? item.assignmentId._doc.instructionFileId._id
              : null,
            instructionFile: item.assignmentId._doc.instructionFileId
              ? item.assignmentId._doc.instructionFileId
              : null,
            solutionVideoId: item.assignmentId._doc.solutionVideoId
              ? item.assignmentId._doc.solutionVideoId._id
              : null,
            solutionVideo: item.assignmentId._doc.solutionVideoId
              ? item.assignmentId._doc.solutionVideoId
              : null,
            solutionFileId: item.assignmentId._doc.solutionFileId
              ? item.assignmentId._doc.solutionFileId._id
              : null,
            solutionFile: item.assignmentId._doc.solutionFileId
              ? item.assignmentId._doc.solutionFileId
              : null,
            assignment: {
              ...item.assignmentId._doc,
            },
          });
        }
      }
    }
    updatedSections.push({ ...section._doc, items: updatedItems });
  }

  updatedCourse.sections = updatedSections;

  const totalCompleted =
    ((enrollment.complete.length / totalLecture) * 100).toFixed() + "%";

  const updatedEnrollment = {
    _id: enrollment._id,
    course: updatedCourse,
    updatedBy: enrollment.updatedBy,
    complete: enrollment.complete,
    complete: enrollment.complete,
    createdAt: enrollment.createdAt,
    updatedAt: enrollment.updatedAt,
    averageRating,
    totalCompleted,
  };

  return updatedEnrollment;
};
