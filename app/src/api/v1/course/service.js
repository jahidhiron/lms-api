// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Course, Review, Enrollment } = require("../models");
const { createSlug } = require("../utils/createSlug");
const { setRedis, getRedis } = require("../init/redis");
const { cachingTime } = require("../../../config");

// find single document
exports.findOneCourseService = async (keyValues, options = {}) => {
  const course = await Course.findOne(keyValues, options);
  return course;
};

// create new course
exports.newCourseService = async ({ body, _id }) => {
  const slugItem = [];
  slugItem.push(body.title);
  let slug = createSlug(slugItem);

  const courses = await Course.find({ slug: new RegExp(slug, "i") });
  if (courses.length > 0) {
    slug = `${slug}-${courses.length}`;
  }

  const newCourse = new Course({
    ...body,
    slug,
    updatedBy: _id,
    paid: body.price && body.price.amount > 0 ? true : false,
  });
  await newCourse.save();

  newCourse.isDelete = undefined;
  newCourse.__v = undefined;

  return newCourse;
};

// update course
exports.updateCourseService = async ({
  course,
  title,
  subTitle,
  desc,
  language,
  level,
  categoryId,
  subCategoryId,
  whatWillLearn,
  prerequisites,
  whoIsThisCourseFor,
  thumbnailId,
  promotionalVideoId,
  price,
  welcomeMsg,
  congratulationsMsg,
  sections,
  _id,
  role,
  status,
}) => {
  const slugItem = [];
  let slug = null;

  if (title) {
    slugItem.push(title);
    slug = createSlug(slugItem);
  }

  const courses = await Course.find({ slug: new RegExp(slug, "i") });
  if (courses.length > 0) {
    slug = `${slug}-${courses.length}`;
  }

  course.title = title ? title : course.title;
  course.subTitle = subTitle;
  course.slug = slug ? slug : course.slug;
  course.status = status ? status : course.status;
  course.desc = desc;
  course.language = language;
  course.level = level;
  course.categoryId = categoryId;
  course.subCategoryId = subCategoryId;
  course.whatWillLearn = whatWillLearn;
  course.prerequisites = prerequisites;
  course.whoIsThisCourseFor = whoIsThisCourseFor;
  course.thumbnailId = thumbnailId;
  course.promotionalVideoId = promotionalVideoId;
  course.price = price;
  course.paid = price && price.amount > 0 ? true : false;
  course.welcomeMsg = welcomeMsg;
  course.congratulationsMsg = congratulationsMsg;
  course.sections = sections;

  if (role === 2) {
    course.updatedBy = _id;
  } else if (role === 1) {
    course.updatedByAdmin = _id;
  }

  // save course
  await course.save();

  return course;
};

// soft delete course
exports.deleteCourseService = async ({ course, _id }) => {
  course.isDelete = true;
  course.deletedAt = new Date().getTime();
  course.deletedBy = _id;

  // save course
  await course.save();
};

// course list
exports.findCoursesService = async (
  keyValues = {},
  { q, page, size, categoryId, subCategoryId, role, _id }
) => {
  let regex = new RegExp(q, "i");
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;

  let query = {
    ...keyValues,
    $or: [{ title: regex }, { subTitle: regex }],
  };

  if (categoryId) {
    query = { ...query, categoryId: new ObjectId(categoryId) };
  }

  if (subCategoryId) {
    query = { ...query, subCategoryId: new ObjectId(subCategoryId) };
  }

  if (role === 2) {
    query = { ...query, updatedBy: _id };
  }

  const courses = await Course.find(query)
    .sort({ updatedAt: -1 })
    .populate({ path: "thumbnailId", select: "path" })
    .select(
      "title slug subTitle price language categoryId subCategoryId level status thumbnailId updatedBy"
    )
    .skip((pageNumber - 1) * sizeNumber)
    .limit(sizeNumber);

  const updatedCourse = [];

  for await (const item of courses) {
    const reviews = await Review.find({ courseId: item._id, isDelete: false });
    let totalReviews = reviews.length;
    let totalRating = 0;

    for (let review of reviews) {
      totalRating += review.rating;
    }

    updatedCourse.push({
      ...item._doc,
      totalReviews,
      averageRating: !totalRating ? 0 : (totalRating / totalReviews).toFixed(1),
    });
  }

  const totalDocuments = await Course.countDocuments(query);
  const totalPage = Math.ceil(totalDocuments / sizeNumber);

  return {
    courses: updatedCourse,
    totalItem: totalDocuments,
    totalPage,
  };
};

// public course list
exports.findPublicCoursesService = async (
  keyValues = {},
  {
    q,
    page,
    size,
    category,
    subCategory,
    level,
    rating,
    duration,
    quiz,
    assignment,
    subtitle,
    sort,
    type,
  }
) => {
  if (
    !page &&
    !size &&
    !q &&
    !level &&
    !duration &&
    !quiz &&
    !assignment &&
    !subtitle &&
    !sort &&
    !type
  ) {
    const cachedResult = await getRedis("courses");
    if (cachedResult) {
      const data = JSON.parse(cachedResult);
      return data;
    }
  }

  const currentTime = new Date();
  let regex = new RegExp(q, "i");
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;

  let query = {
    ...keyValues,
    status: 3,
    $or: [{ title: regex }, { subTitle: regex }],
  };

  if (level) {
    query = { ...query, level };
  }

  const courses = await Course.find(query)
    .populate({ path: "categoryId" })
    .populate({ path: "subCategoryId" })
    .populate({ path: "thumbnailId" })
    .populate({ path: "promotionalVideoId" })
    .populate({ path: "updatedBy", select: "name" })
    .populate({
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
    })
    .sort({ updatedAt: -1 });

  // const oneHour = 3600;
  const oneHour = 40;

  const updatedCourses = [];
  const newDayCount = 30 * 24 * 60 * 60 * 1000;
  const filter = {
    rating: [
      { label: "4.5 & up", value: 4.5, count: 0 },
      { label: "4 & up", value: 4, count: 0 },
      { label: "3.5 & up", value: 3.5, count: 0 },
      { label: "3 & up", value: 3, count: 0 },
    ],
    duration: [
      { label: "0-1h", value: "smallest", count: 0 },
      { label: "1-3h", value: "smaller", count: 0 },
      { label: "3-6h", value: "small", count: 0 },
      { label: "6-17h", value: "medium", count: 0 },
      { label: "17h+", value: "large", count: 0 },
    ],
    features: [
      { label: "Quiz", value: "quiz", count: 0 },
      { label: "Assignment", value: "assignment", count: 0 },
      { label: "Subtitle", value: "subtitle", count: 0 },
    ],
    level: [
      { label: "All Level", value: "All Level", count: 0 },
      { label: "Beginner", value: "Beginner", count: 0 },
      { label: "Intermediate", value: "Intermediate", count: 0 },
      { label: "Expert", value: "Expert", count: 0 },
    ],
    price: [
      { label: "Paid", value: "paid", count: 0 },
      { label: "Free", value: "free", count: 0 },
    ],
  };

  const reviews = await Review.find({
    isDelete: false,
  });

  const enrollments = await Enrollment.find({ isDelete: false });

  for await (let course of courses) {
    let lectureCount = 0;
    let totalLength = 0;
    let totalQuiz = 0;
    let totalAssignment = 0;
    let totalSubtitle = 0;

    for (let section of course.sections) {
      for (let item of section.items) {
        if (item.lectureId) {
          lectureCount++;
          if (item.lectureId.videoId && item.lectureId.videoId.timeLength) {
            totalLength += item.lectureId.videoId.timeLength;
            totalSubtitle += item.lectureId.cations.length;
          }
        }
        if (item.quizId) {
          totalQuiz++;
        }
        if (item.assignmentId) {
          totalAssignment++;
        }
      }
    }

    let totalReviews = 0;
    let totalRating = 0;
    let totalEnrollments = 0;

    for (let review of reviews) {
      if (String(review.courseId) === String(course._id)) {
        totalRating += review.rating;
        totalReviews++;
      }
    }

    for (const enrollment of enrollments) {
      if (String(enrollment.courseId) === String(course._id)) {
        totalEnrollments++;
      }
    }

    const averageRating = !totalRating
      ? 0
      : (totalRating / totalReviews).toFixed(1);

    const formatCourse = () => {
      updatedCourses.push({
        _id: course._id,
        price: course.price,
        title: course.title,
        slug: course.slug,
        subTitle: course.subTitle,
        whatWillLearn: course.whatWillLearn,
        language: course.language,
        level: course.level,
        categoryId:
          course.categoryId && course.categoryId._id
            ? course.categoryId._id
            : null,
        category: course.categoryId
          ? {
              _id: course.categoryId._id,
              title: course.categoryId.title,
              slug: course.categoryId.slug,
            }
          : null,
        subCategoryId:
          course.subCategoryId && course.subCategoryId._id
            ? course.subCategoryId._id
            : null,
        subCategory: course.subCategoryId
          ? {
              _id: course.subCategoryId._id,
              title: course.subCategoryId.title,
              slug: course.subCategoryId.slug,
            }
          : null,
        updatedBy: course.updatedBy,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        thumbnailId: course.thumbnailId ? course.thumbnailId._id : null,
        thumbnail: course.thumbnailId ? course.thumbnailId : null,
        lectureCount,
        totalLength,
        totalReviews,
        averageRating,
        new:
          new Date(course.updatedAt).getTime() >
          currentTime.getTime() - newDayCount,
        totalQuiz,
        totalAssignment,
        totalSubtitle,
        paid: course.paid,
        totalEnrollments,
      });

      // rating filter
      if (averageRating >= 4.5) {
        filter.rating[0]["count"] += 1;
      }
      if (averageRating >= 4) {
        filter.rating[1]["count"] += 1;
      }
      if (averageRating >= 3.5) {
        filter.rating[2]["count"] += 1;
      }
      if (averageRating >= 3) {
        filter.rating[3]["count"] += 1;
      }

      // duration filter
      if (totalLength > 0 && totalLength <= oneHour) {
        filter.duration[0]["count"] += 1;
      } else if (totalLength > oneHour && totalLength <= oneHour * 3) {
        filter.duration[1]["count"] += 1;
      } else if (totalLength > oneHour * 3 && totalLength <= oneHour * 6) {
        filter.duration[2]["count"] += 1;
      } else if (totalLength > oneHour * 6 && totalLength <= oneHour * 17) {
        filter.duration[3]["count"] += 1;
      } else if (totalLength > oneHour * 17) {
        filter.duration[4]["count"] += 1;
      }

      // feature filter
      if (totalQuiz > 0) {
        filter.features[0]["count"] += 1;
      }
      if (totalAssignment > 0) {
        filter.features[1]["count"] += 1;
      }
      if (totalSubtitle > 0) {
        filter.features[2]["count"] += 1;
      }

      // level filter
      if (course.level === "All Level") {
        filter.level[0]["count"] += 1;
      } else if (course.level === "Beginner") {
        filter.level[1]["count"] += 1;
      } else if (course.level === "Intermediate") {
        filter.level[2]["count"] += 1;
      } else if (course.level === "Expert") {
        filter.level[3]["count"] += 1;
      }

      // price filter
      if (course.paid === true) {
        filter.price[0]["count"] += 1;
      } else if (course.paid === false) {
        filter.price[1]["count"] += 1;
      }
    };

    if (duration || rating || quiz || assignment || subtitle || type) {
      if (duration) {
        if (duration === "smallest" && totalLength <= oneHour) {
          formatCourse();
        } else if (
          duration === "smaller" &&
          totalLength > oneHour &&
          totalLength <= oneHour * 3
        ) {
          formatCourse();
        } else if (
          duration === "small" &&
          totalLength > oneHour * 3 &&
          totalLength <= oneHour * 6
        ) {
          formatCourse();
        } else if (
          duration === "medium" &&
          totalLength > oneHour * 6 &&
          totalLength <= oneHour * 17
        ) {
          formatCourse();
        } else if (duration === "large" && totalLength > oneHour * 17) {
          formatCourse();
        }
      }

      if (rating && rating <= averageRating) {
        formatCourse();
      }
      if (quiz && quiz === "quiz" && totalQuiz > 0) {
        formatCourse();
      }
      if (assignment && assignment === "assignment" && totalAssignment > 0) {
        formatCourse();
      }
      if (subtitle && subtitle === "subtitle" && totalSubtitle > 0) {
        formatCourse();
      }
      if (type && type === "paid" && course.paid === true) {
        formatCourse();
      } else if (type && type === "free" && course.paid === false) {
        formatCourse();
      }
    } else if (category) {
      if (
        course.categoryId &&
        course.categoryId.slug &&
        course.categoryId.slug === category
      ) {
        formatCourse();
      }
    } else if (subCategory) {
      if (
        course.subCategoryId &&
        course.subCategoryId.slug &&
        course.subCategoryId.slug === subCategory
      ) {
        formatCourse();
      }
    } else {
      formatCourse();
    }
  }

  let sortedCourse = [];
  if (sort) {
    if (sort === "latest") {
      sortedCourse = updatedCourses.sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    } else if (sort === "reviewed") {
      sortedCourse = updatedCourses.sort((a, b) => {
        return b.totalReviews - a.totalReviews;
      });
    } else if (sort === "rated") {
      sortedCourse = updatedCourses.sort((a, b) => {
        return b.averageRating - a.averageRating;
      });
    }
  } else {
    sortedCourse = updatedCourses;
  }

  const totalDocuments = sortedCourse.length;
  const finalCourse = sortedCourse.slice(
    (pageNumber - 1) * sizeNumber,
    pageNumber * sizeNumber
  );
  const totalPage = Math.ceil(totalDocuments / sizeNumber);

  const data = {
    courses: finalCourse,
    filter,
    totalItem: totalDocuments,
    totalPage,
  };

  if (
    !page &&
    !size &&
    !q &&
    !level &&
    !duration &&
    !quiz &&
    !assignment &&
    !subtitle &&
    !sort &&
    !type
  ) {
    const cachedResult = await getRedis("courses");
    if (cachedResult) {
      await setRedis("courses", JSON.stringify(data), "EX", cachingTime);
    }
  }

  return data;
};

// detail course
exports.findCourseService = async (keyValues = {}, { _id, role }) => {
  const key = keyValues["key"];
  let query = {
    isDelete: false,
  };

  if (ObjectId.isValid(key)) {
    query = { ...query, _id: key };
  } else {
    query = { ...query, slug: key };
  }

  if (role === 2) {
    query = { ...query, updatedBy: _id };
  }

  const course = await Course.findOne(query)
    .populate({ path: "updatedBy", select: "name avatar role" })
    .populate({ path: "categoryId" })
    .populate({ path: "subCategoryId" })
    .populate({ path: "thumbnailId" })
    .populate({ path: "promotionalVideoId" })
    .populate({
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
    });

  if (!course) {
    return null;
  }

  let totalVideoLength = 0;
  if (course) {
    const sections = course.sections;
    for (let section of sections) {
      for (let item of section.items) {
        if (item.lectureId && item.lectureId.videoId) {
          totalVideoLength += item.lectureId.videoId.timeLength;
        }
      }
    }
  }

  const reviews = await Review.find({
    courseId: course._id,
    isDelete: false,
  });
  let totalReviews = reviews.length;
  let totalRating = 0;

  for (let review of reviews) {
    totalRating += review.rating;
  }

  const updatedCourse = {
    ...course._doc,
    thumbnail: course.thumbnailId ? course.thumbnailId : null,
    thumbnailId:
      course.thumbnailId && course.thumbnailId._id
        ? course.thumbnailId._id
        : null,
    promotionalVideo: course.promotionalVideoId
      ? course.promotionalVideoId
      : null,
    promotionalVideoId:
      course.promotionalVideoId && course.promotionalVideoId._id
        ? course.promotionalVideoId._id
        : null,
    category: course.categoryId ? course.categoryId : null,
    categoryId:
      course.categoryId && course.categoryId._id ? course.categoryId._id : null,
    subCategory: course.subCategoryId ? course.subCategoryId : null,
    subCategoryId:
      course.subCategoryId && course.subCategoryId._id
        ? course.subCategoryId._id
        : null,
    totalReviews,
    averageRating: !totalRating ? 0 : (totalRating / totalReviews).toFixed(1),
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
            for (let caption of item.lectureId.cations) {
              if (caption.fileId) {
                updatedCaptions.push({
                  ...caption._doc,
                  fileId: caption.fileId._id,
                  file: {
                    ...caption.fileId._doc,
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

  return { ...updatedCourse, totalVideoLength };
};

// public detail course
exports.findPublicCourseService = async (keyValues = {}) => {
  const key = keyValues["key"];
  let query = {
    isDelete: false,
  };

  if (ObjectId.isValid(key)) {
    query = { ...query, _id: key };
  } else {
    query = { ...query, slug: key };
  }

  const course = await Course.findOne(query)
    .populate({ path: "updatedBy", select: "name avatar role" })
    .populate({ path: "categoryId" })
    .populate({ path: "subCategoryId" })
    .populate({ path: "thumbnailId" })
    .populate({ path: "promotionalVideoId" })
    .populate({
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
          ],
        },
        {
          path: "quizId",
        },
      ],
    });

  let totalVideoLength = 0;
  let downloaableResoure = 0;
  if (course) {
    const sections = course.sections;
    for (let section of sections) {
      const items = [];
      for (let item of section.items) {
        if (item.lectureId) {
          // counting video length
          if (item.lectureId.videoId) {
            totalVideoLength += item.lectureId.videoId.timeLength;
          }

          if (item.lectureId.resources && item.lectureId.resources.length > 0) {
            for (resource of item.lectureId.resources) {
              if (resource.fileId) {
                downloaableResoure++;
              }
            }
          }

          // removing video path and resources
          const videoId = item.lectureId.videoId;
          let updatedVideo = {};
          if (!item.lectureId.preview) {
            if (videoId) {
              updatedVideo = {
                _id: videoId._id,
                name: videoId.name,
                timeLength: videoId.timeLength,
              };
            }
          } else {
            updatedVideo = {
              _id: videoId._id,
              name: videoId.name,
              path: videoId.path,
              timeLength: videoId.timeLength,
            };
          }
          const updatedIdtem = {
            ...item,
            lectureId: {
              ...item.lectureId,
              videoId: updatedVideo,
              resources: null,
            },
          };

          items.push(updatedIdtem);
        }
      }
      section.items = items;
    }
  }

  if (!course) {
    return null;
  }

  const reviews = await Review.find({
    courseId: course._id,
    isDelete: false,
  });
  let totalReviews = reviews.length;
  let totalRating = 0;

  for (let review of reviews) {
    totalRating += review.rating;
  }

  const totalEnrollments = await Enrollment.countDocuments({
    courseId: course._id,
    isDelete: false,
  });

  return {
    ...course._doc,
    categoryId:
      course.categoryId && course.categoryId._id ? course.categoryId._id : null,
    category: course.categoryId ? course.categoryId : null,
    subCategoryId:
      course.subCategoryId && course.subCategoryId._id
        ? course.subCategoryId._id
        : null,
    subCategory: course.subCategoryId ? course.subCategoryId : null,
    totalVideoLength,
    totalReviews,
    averageRating: !totalRating ? 0 : (totalRating / totalReviews).toFixed(1),
    totalEnrollments,
    downloaableResoure,
  };
};
