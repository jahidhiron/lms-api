const { findConversationsService } = require("./service");

// list conversation
exports.conversations = async (req, res, next) => {
  const { _id } = req.user;
  const { courseId } = req.query;
  const query = { isDelete: false };
  let options = {
    courseId,
    _id,
  };

  try {
    // list
    const conversations = await findConversationsService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("conversationListSucc"),
      data: { ...conversations },
    });
  } catch (error) {
    next(error, req, res);
  }
};
