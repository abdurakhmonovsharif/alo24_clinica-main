const { CounterDoctor } = require("../../models/CounterDoctor/CounterDoctor");
const { Clinica } = require("../../models/DirectorAndClinica/Clinica");
const { OfflineService } = require("../../models/OfflineClient/OfflineService");
const {
  StatsionarRoom,
} = require("../../models/StatsionarClient/StatsionarRoom");
require("../../models/StatsionarClient/StatsionarConnector");
require("../../models/StatsionarClient/StatsionarClient");
require("../../models/OfflineClient/OfflineClient");
const { User } = require("../../models/Users");

module.exports.create = async (req, res) => {
  try {
    const {
      _id,
      clinica,
      firstname,
      lastname,
      counter_agent,
      clinica_name,
      phone,
      statsionar_profit,
    } = req.body;

    const clinic = await Clinica.findById(clinica);
    if (!clinic) {
      return res.status(400).json({
        message: "Diqqat! Klinika ma'lumotlari topilmadi.",
      });
    }

    if (_id) {
      await CounterDoctor.findByIdAndUpdate(_id, {
        firstname: firstname,
        lastname: lastname,
        clinica_name: clinica_name,
        phone: phone,
        statsionar_profit: statsionar_profit,
      });

      const counterDoctor = await CounterDoctor.findByIdAndUpdate(_id).lean();

      return res.status(200).json(counterDoctor);
    } else {
      const counterDoctor = new CounterDoctor({
        firstname,
        lastname,
        clinica,
        clinica_name,
        counter_agent,
        phone,
        statsionar_profit,
      });
      await counterDoctor.save();

      return res.status(200).json(counterDoctor);
    }
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.get = async (req, res) => {
  try {
    const { counterdoctor, counter_agent, beginDay, endDay, clinica } =
      req.body;

    let offlineservices = [];
    if (!counterdoctor) {
      offlineservices = await OfflineService.find({
        clinica,
        createdAt: {
          $gte: beginDay,
          $lt: endDay,
        },
      })
        .select("service createdAt counterdoctor pieces refuse")
        .populate({
          path: "counterdoctor",
          select: "firstname lastname clinica_name counter_agent",
          match: { counter_agent: counter_agent },
        })
        .populate("client", "firstname lastname createdAt")
        .lean()
        .then((services) => {
          return services.filter(
            (service) => !service.refuse && service.counterdoctor
          );
        });
    } else {
      offlineservices = await OfflineService.find({
        clinica,
        counterdoctor: counterdoctor,
        createdAt: {
          $gte: beginDay,
          $lt: endDay,
        },
      })
        .select("service createdAt counterdoctor pieces refuse")
        .populate("counterdoctor", "firstname lastname clinica_name")
        .populate("client", "firstname lastname")
        .lean()
        .then((services) => {
          return services.filter((service) => !service.refuse);
        });
    }

    for (const service of offlineservices) {
      service.totalprice = service.service.price * service.pieces;
      service.counterdoctor_profit =
        service.service.counterDoctorProcient <= 100
          ? ((service.service.price * service.pieces) / 100) *
            service.service.counterDoctorProcient
          : service.service.counterDoctorProcient;
      service.counteragent_profit =
        service.service.counterAgentProcient <= 100
          ? ((service.service.price * service.pieces) / 100) *
            service.service.counterAgentProcient
          : service.service.counterAgentProcient;
    }

    res.status(200).json(offlineservices);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.getStatsionarProfit = async (req, res) => {
  try {
    const { counterdoctor, counter_agent, beginDay, endDay, clinica } =
      req.body;

    let statsionarrooms = [];

    if (!counterdoctor) {
      statsionarrooms = await StatsionarRoom.find({
        clinica,
        createdAt: {
          $gte: beginDay,
          $lt: endDay,
        },
      })
        .select("-__v -updatedAt -isArchive")
        .populate("connector")
        .populate("client", "firstname lastname createdAt")
        .populate({
          path: "counterdoctor",
          select: "-__v -updatedAt -isArchive",
          match: { counter_agent: counter_agent },
        })
        .lean()
        .then((rooms) => {
          return rooms.filter((room) => room.counterdoctor);
        });
    } else {
      statsionarrooms = await StatsionarRoom.find({
        clinica,
        createdAt: {
          $gte: beginDay,
          $lt: endDay,
        },
      })
        .select("-__v -updatedAt -isArchive")
        .populate("counterdoctor")
        .populate("client", "firstname lastname")
        .lean()
        .then((rooms) =>
          rooms.filter(
            (room) =>
              room.counterdoctor &&
              String(room.counterdoctor._id) === String(counterdoctor)
          )
        );
    }

    res.status(200).json(statsionarrooms);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.getDcotors = async (req, res) => {
  try {
    const { clinica, counter_agent } = req.body;

    const clinic = await Clinica.findById(clinica);
    if (!clinic) {
      return res.status(400).json({
        message: "Diqqat! Klinika ma'lumotlari topilmadi.",
      });
    }

    if (counter_agent) {
      const counterDoctors = await CounterDoctor.find({
        clinica,
        counter_agent,
      })
        .select("-__v -isArchive -updatedAt")
        .lean();

      return res.status(200).json(counterDoctors);
    } else {
      const counterDoctors = await CounterDoctor.find({
        clinica,
      })
        .select("-__v -isArchive -updatedAt")
        .populate("counter_agent", "firstname lastname")
        .lean();

      return res.status(200).json(counterDoctors);
    }
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};

module.exports.getCounterAgents = async (req, res) => {
  try {
    const { clinica, beginDay, endDay } = req.body;

    const clinic = await Clinica.findById(clinica);
    if (!clinic) {
      return res.status(400).json({
        message: "Diqqat! Klinika ma'lumotlari topilmadi.",
      });
    }

    const counteragents = await User.find({
      clinica,
      type: "CounterAgent",
    })
      .select("firstname lastname clinica")
      .lean();

    for (const counteragent of counteragents) {
      const counterdoctors = await CounterDoctor.find({
        clinica,
        counter_agent: counteragent._id,
      })
        .select("-__v -isArchive -updatedAt")
        .lean();

      counteragent.totalprice = 0;
      counteragent.counteragent_profit = 0;
      counteragent.counterdoctor_profit = 0;
      counteragent.clients = 0;
      counteragent.counterdoctors = 0;

      for (const counterdoctor of counterdoctors) {
        const offlineservices = await OfflineService.find({
          clinica,
          createdAt: {
            $gte: beginDay,
            $lte: endDay,
          },
          counterdoctor: counterdoctor._id,
        })
          .select("service pieces client createdAt")
          .lean();

        if (offlineservices.length > 0) {
          counteragent.counterdoctors += 1;
        }

        counteragent.totalprice += offlineservices.reduce(
          (prev, el) => prev + el.service.price * el.pieces,
          0
        );
        counteragent.counteragent_profit += offlineservices.reduce(
          (prev, el) => {
            if (el.service.counterAgentProcient <= 100) {
              prev +=
                ((el.service.price * el.pieces) / 100) *
                el.service.counterAgentProcient;
            } else {
              prev += el.service.counterAgentProcient;
            }
            return prev;
          },
          0
        );
        counteragent.counterdoctor_profit += offlineservices.reduce(
          (prev, el) => {
            if (el.service.counterDoctorProcient <= 100) {
              prev +=
                ((el.service.price * el.pieces) / 100) *
                el.service.counterDoctorProcient;
            } else {
              prev += el.service.counterDoctorProcient;
            }
            return prev;
          },
          0
        );

        let clientsid = [];
        counteragent.clients += offlineservices.reduce((prev, el) => {
          if (!clientsid.includes(String(el.client))) {
            prev += 1;
            clientsid.push(String(el.client));
          }
          return prev;
        }, 0);
      }
    }

    res.status(200).json(counteragents);
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
  }
};
