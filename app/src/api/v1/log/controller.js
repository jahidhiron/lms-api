// custom
const { listService, detailService } = require("./service");

// search list
exports.list = async (req, res) => {
  const { status, code, message, data } = await listService({
    ...req.user,
    ...req.query,
  });
  if (data.logs && data.logs.length > 0) {
    return res.status(code).json({ code, status, message, data });
  }
  res.status(code).json({ code, status, message });
};

// detailed
exports.detail = async (req, res) => {
  const { status, code, message, data } = await detailService({
    ...req.user,
    ...req.params,
  });
  if (data.log) {
    return res.status(code).json({ code, status, message, data });
  }
  res.status(code).json({ code, status, message });
};
