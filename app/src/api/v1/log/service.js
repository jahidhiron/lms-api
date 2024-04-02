// lib
const { Types } = require("mongoose");

// custom
const { Log } = require("../models");
const createLog = require("../utils/createLog");

// search list
exports.listService = async ({ _id, name, page, size, q }) => {
  const response = {
    code: 200,
    status: "success",
    message: "Fetch logs successfully",
    data: {},
  };

  try {
    let query = { userId: Types.ObjectId(_id) };
    const p = parseInt(page) || 1;
    const limit = parseInt(size) || 10;
    const skip = (p - 1) * limit;

    if (q !== "undefined" && q !== undefined) {
      let regex = new RegExp(q, "i");
      query = {
        ...query,
        $or: [{ title: regex }, { desc: regex }],
      };
    }

    const result = await Log.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          title: 1,
          desc: 1,
          createdAt: 1,
          updatedAt: 1,
          updatedBy: 1,
          userId: "$user._id",
          userName: "$user.name",
          userEmail: "$user.email",
          lang: "$user.lang",
          role: "$user.role",
          lastLogin: "$user.lastLogin",
          verified: "$user.verified.email.status",
        },
      },
      { $sort: { _id: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page: p } }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const { metadata, data: logs } = result[0];

    if (logs.length === 0) {
      response.code = 404;
      response.status = "failed";
      response.message = "No logs data found";
      return response;
    }

    // logs
    const ok = await createLog({
      title: `Fetch logs`,
      desc: `Fetch logs${q ? " Search by " + q : ""}`,
      userId: _id,
      userName: name,
    });
    if (!ok) {
      response.code = 500;
      response.status = "failed";
      response.message = "Error. Try again";
      return response;
    }

    const { total: totalDocuments } = metadata[0];
    response.data = {
      logs,
      totalDocuments,
      totalPage: Math.ceil(totalDocuments / limit),
      currentPage: p,
    };

    return response;
  } catch (error) {
    response.code = 500;
    response.status = "failed";
    response.message = "Error. Try again";
    return response;
  }
};

// detailed
exports.detailService = async ({ _id, name, id }) => {
  const response = {
    code: 200,
    status: "success",
    message: "Fetch log successfully",
    data: {},
  };

  try {
    const result = await Log.aggregate([
      {
        $match: { _id: Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          title: 1,
          desc: 1,
          createdAt: 1,
          updatedAt: 1,
          updatedBy: 1,
          userId: "$user._id",
          userName: "$user.name",
          userEmail: "$user.email",
          lang: "$user.lang",
          role: "$user.role",
          lastLogin: "$user.lastLogin",
          verified: "$user.verified.email.status",
        },
      },
    ]);

    if (result.length === 0) {
      response.code = 404;
      response.status = "failed";
      response.message = "No log data found";
      return response;
    }

    // logs
    const ok = await createLog({
      title: `Fetch log`,
      desc: `Fetch log by log id ${result[0]._id}`,
      userId: _id,
      userName: name,
    });
    if (!ok) {
      response.code = 500;
      response.status = "failed";
      response.message = "Error. Try again";
      return response;
    }

    response.data.log = result[0];

    return response;
  } catch (error) {
    response.code = 500;
    response.status = "failed";
    response.message = "Error. Try again";
    return response;
  }
};
