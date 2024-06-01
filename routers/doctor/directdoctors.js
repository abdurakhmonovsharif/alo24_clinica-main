const { Clinica } = require("../../models/DirectorAndClinica/Clinica");
const { AddedService } = require("../../models/Services/AddedService");
const { User } = require("../../models/Users");
require("../../models/OfflineClient/OfflineService");
require('../../models/Services/Department')
require('../../models/OfflineClient/OfflineClient')


module.exports.getDirectDoctors = async (req, res) => {
    try {
        const { clinica, beginDay, endDay } = req.body;

        const clinic = await Clinica.findById(clinica);

        if (!clinic) {
            return res.status(400).json({
                message: "Diqqat! Klinika ma'lumotlari topilmadi.",
            });
        }

        const doctors = await User.find({
            clinica,
            type: "Doctor"
        })
            .select('-isArchive -password -updatedAt -__v')
            .populate('specialty', 'name')
            .lean()

        for (const doctor of doctors) {
            const services = await AddedService.find({
                doctor: doctor._id,
                createdAt: {
                    $gte: beginDay,
                    $lte: endDay,
                }
            })
                .populate('service', 'service pieces')
                .lean()

            doctor.total = services.reduce((prev, el) => prev + (el.service.pieces * el.service.service.price), 0)
        }


        res.status(200).send(doctors);
    } catch (error) {
        console.log(error);
        res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
    }
};

module.exports.getDirectService = async (req, res) => {
    try {
        const { doctor, beginDay, endDay } = req.body;

        const services = await AddedService.find({
            doctor: doctor,
            createdAt: {
                $gte: beginDay,
                $lte: endDay,
            }
        })
            .populate({
                path: 'service',
                select: 'service pieces department client',
                populate: {
                    path: "client",
                    select: "firstname lastname"
                }
            })
            .populate({
                path: 'service',
                select: 'service pieces department client',
                populate: {
                    path: "department",
                    select: "name"
                }
            })
            .lean()

            (services);

        res.status(200).send(services);

    } catch (error) {
        console.log(error);
        res.status(501).json({ error: "Serverda xatolik yuz berdi..." });
    }
}