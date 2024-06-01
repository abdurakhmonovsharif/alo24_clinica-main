const axios = require("axios");
const config = require("config");
const { Product } = require("../../models/Warehouse/Product");
const { Clinica } = require("../../models/DirectorAndClinica/Clinica");
require("../../models/Services/Department");
const { User } = require("../../models/Users");
const {
  OnlineClient,
  validateOnlineClient,
} = require("../../models/OnlineClient/OnlineClient");

const handleSend = async (smsKey, number, message) => {
  await axios
    .get(
      `https://smsapp.uz/new/services/send.php?key=${smsKey}&number=${number}&message=${message}`
    )
    .then((res) => {
      console.log("ok");
    })
    .catch((err) => {
      console.log("Error: ", err.message);
    });
};

// register
module.exports.register = async (req, res) => {
  try {
    const { client } = req.body;
    //=========================================================
    // CheckData
    const checkClient = validateOnlineClient(client).error;
    if (checkClient) {
      return res.status(400).json({
        error: checkClient.message,
      });
    }

    //=========================================================
    // CreateClient

    const newclient = new OnlineClient({ ...client });
    await newclient.save();

    const response = await OnlineClient.findById(newclient._id);

    const clientData = await OnlineClient.findById(newclient._id)
      .populate("clinica")
      .populate("department", "name");

    const bronDate = new Date(clientData.brondate);
    bronDate.setHours(bronDate.getHours() + 3);

    await handleSend(
      clientData.clinica.smsKey,
      `998${clientData.phone}`,
      `Huramtli ${clientData.firstname} ${
        clientData.lastname
      }! Eslatib o'tamiz, siz ${new Date(bronDate).toLocaleDateString(
        "ru-RU"
      )} kuni, soat ${new Date(bronDate).getHours()}:${
        new Date(bronDate).getMinutes() < 10
          ? "0" + new Date(bronDate).getMinutes()
          : new Date(bronDate).getMinutes()
      } da ${clientData.clinica.name} ning ${
        clientData.department.name
      } bo'limiga qabulga yozilgansiz! Iltimos kech qolmang! Ma'lumot uchun: ${
        clientData.clinica.phone1
      }`
    );

    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { client } = req.body;
    //=========================================================

    await OnlineClient.findByIdAndUpdate(client._id, { ...client });

    const response = await OnlineClient.findById(client._id);

    res.status(201).send(response);
  } catch (error) {
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.getDoctors = async (req, res) => {
  try {
    const { clinica } = req.body;

    const clinic = await Clinica.findById(clinica);

    if (!clinic) {
      return res.status(400).json({
        message: "Diqqat! Klinika ma'lumotlari topilmadi.",
      });
    }

    const doctors = await User.find({
      clinica,
    })
      .select("firstname lastname specialty type")
      .populate("specialty", "name")
      .lean()
      .then((doctors) =>
        doctors.filter((doctor) => {
          if (doctor.type === "Laborotory" || doctor.type === "Doctor") {
            return doctor.specialty;
          }
        })
      );

    for (const doctor of doctors) {
      const clients = await OnlineClient.find({
        clinica,
        department: doctor.specialty._id,
        brondate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 0)),
        },
      });
      doctor.clients = clients.length;
    }

    res.status(201).send(doctors);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.getClients = async (req, res) => {
  try {
    const { department, clinica, beginDay, type } = req.body;

    const clinic = await Clinica.findById(clinica);

    if (!clinic) {
      return res.status(400).json({
        message: "Diqqat! Klinika ma'lumotlari topilmadi.",
      });
    }

    let clients = [];

    if (type === "late") {
      clients = await OnlineClient.find({
        clinica,
        department,
        brondate: {
          $lte: beginDay,
        },
      })
        .select("-__v -updatedAt -isArchive")
        .lean();
    } else {
      clients = await OnlineClient.find({
        clinica,
        department,
        brondate: {
          $gte: beginDay,
        },
      })
        .select("-__v -updatedAt -isArchive")
        .lean();
    }

    res.status(200).json(clients);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.body;
    //=========================================================

    await OnlineClient.findByIdAndDelete(id);

    res.status(201).send({ message: "Mijoz o'chirildi" });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};
