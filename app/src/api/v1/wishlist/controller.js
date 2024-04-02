// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound, BadRequest } = require("../utils/errors");
const {
  newWishlistService,
  findOneWishlistService,
  updateWishlistService,
  deleteWishlistService,
  findWishlistsService,
  findWishlistService,
} = require("./service");
const { findOneCourseService } = require("../course/service");

// add wishlist
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { courseId } = req.body;
  const { _id } = req.user;

  try {
    // course checking
    const isCourseExist = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!isCourseExist) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // wishlist checking
    const isWishlistExist = await findOneWishlistService({
      courseId,
      updatedBy: _id,
      isDelete: false,
    });
    if (isWishlistExist) {
      throw new BadRequest(req.__("wishlistExistError"));
    }

    // add wishlist
    const wishlist = await newWishlistService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add wishlist`,
      desc: `Wishlist for course id "${courseId}" and wishlist id "${wishlist._id} is added"`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("wishlistAddSucc"),
      data: { wishlist },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update wishlist
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { courseId } = req.body;
  const { _id } = req.user;

  try {
    // find wishlist
    const wishlist = await findOneWishlistService(
      {
        _id: id,
        updatedBy: _id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!wishlist) {
      throw new NotFound(req.__("wishlistNotFoundErr"));
    }

    // title checking
    const isCourseExist = await findOneWishlistService({
      courseId,
      updatedBy: _id,
      isDelete: false,
    });
    if (
      isCourseExist &&
      String(courseId) === String(isCourseExist.courseId) &&
      String(wishlist._id) !== String(isCourseExist._id)
    ) {
      throw new BadRequest(req.__("wishlistExistError"));
    }

    if (courseId) {
      // course checking
      const isCourseExist = await findOneCourseService({
        _id: courseId,
        isDelete: false,
      });
      if (!isCourseExist) {
        throw new NotFound(req.__("courseNotFoundErr"));
      }
    }

    // update wishlist
    const updatedWishlist = await updateWishlistService({
      ...req.body,
      _id,
      wishlist,
    });

    // save activity log
    await createActivityLog({
      title: `Update wishlist`,
      desc: `Wishlist id "${wishlist._id}" with course id "${wishlist.courseId}" is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("wishlistUpdateSucc"),
      data: { wishlist: updatedWishlist },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove wishlist
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find wishlist
    const wishlist = await findOneWishlistService(
      {
        _id: id,
        updatedBy: _id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!wishlist) {
      throw new NotFound(req.__("wishlistNotFoundErr"));
    }

    // soft delete wishlist
    await deleteWishlistService({ wishlist, _id });

    // save activity log
    await createActivityLog({
      title: `Delete wishlist`,
      desc: `${wishlist._id} wishlist id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("wishlistDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list wishlist
exports.wishlists = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { page, size } = req.query;
  const query = { isDelete: false };
  let options = {
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    // list
    const wishlists = await findWishlistsService(query, options);

    // save activity log
    await createActivityLog({
      title: `List wishlist`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("wishlistListSucc"),
      data: { ...wishlists },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// wishlist detail
exports.wishlist = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const wishlist = await findWishlistService(keyValues);
    if (!wishlist) {
      throw new NotFound(req.__("wishlistNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Detail wishlist`,
      desc: `Get detail wishlist by "${wishlist._id}" id `,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("wishlistDetailSucc"),
      data: { wishlist },
    });
  } catch (error) {
    next(error, req, res);
  }
};
