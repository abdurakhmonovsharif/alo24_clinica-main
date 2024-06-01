import { useToast } from "@chakra-ui/react";
import { faPenAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";
import { useHttp } from "../../hooks/http.hook";
import { Pagination } from "../reseption/components/Pagination";
import { checkClientData } from "../reseption/onlineclients/checkData/checkData";
import { DatePickers } from "../reseption/onlineclients/clientComponents/DatePickers";
import { RegisterClient } from "../reseption/onlineclients/clientComponents/RegisterClient";
import { Modal, Modal as Modal2 } from "./components/Modal";


export const OnlineClients = () => {
    const [beginDay, setBeginDay] = useState(new Date());
    const [endDay, setEndDay] = useState(
        new Date(new Date().setDate(new Date().getDate() + 1))
    );
    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    // MODAL
    const [modal, setModal] = useState(false);
    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);
    //====================================================================
    //====================================================================
    const { t } = useTranslation()
    //====================================================================
    //====================================================================
    // RegisterPage
    const [visible, setVisible] = useState(false);

    const changeVisible = () => setVisible(!visible);

    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [countPage, setCountPage] = useState(10);

    const indexLastConnector = (currentPage + 1) * countPage;
    const indexFirstConnector = indexLastConnector - countPage;
    const [currentConnectors, setCurrentConnectors] = useState([]);

    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    const toast = useToast();

    const notify = useCallback(
        (data) => {
            toast({
                title: data.title && data.title,
                description: data.description && data.description,
                status: data.status && data.status,
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });
        },
        [toast]
    );
    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    const { request, loading } = useHttp();
    const auth = useContext(AuthContext);

    //====================================================================
    //====================================================================
    const [type, setType] = useState('today')
    //====================================================================
    //====================================================================
    // getConnectors
    const [connectors, setConnectors] = useState([]);
    const [searchStorage, setSearchStrorage] = useState([]);

    const getConnectors = useCallback(
        async (type) => {
            try {
                const data = await request(
                    `/api/onlineclient/client/getall`,
                    "POST",
                    { clinica: auth && auth.clinica._id, department: auth?.user?.specialty?._id, beginDay: new Date, type },
                    {
                        Authorization: `Bearer ${auth.token}`,
                    }
                );
                setConnectors(data);
                setSearchStrorage(data);
                setCurrentConnectors(
                    data.slice(indexFirstConnector, indexLastConnector)
                );
            } catch (error) {
                notify({
                    title: t(`${error}`),
                    description: "",
                    status: "error",
                });
            }
        },
        [request, auth, notify, indexFirstConnector, indexLastConnector]
    );
    //====================================================================
    //====================================================================+

    //====================================================================
    //====================================================================
    // SEARCH
    const searchFullname = (e) => {
        const searching = searchStorage.filter((item) =>
            (item.firstname + item.lastname)
                .toLowerCase()
                .includes(e.target.value.toLowerCase())
        );
        setConnectors(searching);
        setCurrentConnectors(searching.slice(0, countPage));
    }

    const searchPhone = (e) => {
        const searching = searchStorage.filter((item) =>
            item.phone
                .toLowerCase()
                .includes(e.target.value.toLowerCase())
        );
        setConnectors(searching);
        setCurrentConnectors(searching.slice(0, countPage));
    }
    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    const setPageSize =
        (e) => {
            setCurrentPage(0);
            setCountPage(e.target.value);
            setCurrentConnectors(connectors.slice(0, countPage));
        }
    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    // CLIENT

    const [client, setClient] = useState({
        clinica: auth.clinica && auth.clinica._id,
        reseption: auth.user && auth.user._id,
        department: auth?.user?.specialty?._id
    });

    const changeClientData = (e) => {
        setClient({ ...client, [e.target.name]: e.target.value });
    };

    const [clientDate, setClientDate] = useState(new Date().toISOString().slice(0, 10))

    const changeClientBorn = (e) => {
        setClientDate(e.target.value)
        setClient({ ...client, brondate: new Date(e.target.value) });
    };
    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    // CLEAR

    const clearDatas = useCallback(() => {
        setClient({
            clinica: auth.clinica && auth.clinica._id,
            reseption: auth.user && auth.user._id,
        });
    }, [auth]);

    const checkData = () => {
        if (checkClientData(client, t)) {
            return notify(checkClientData(client, t));
        }
        setModal(true);
    };
    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    // CreateHandler

    const createHandler = useCallback(async () => {
        try {
            const data = await request(
                `/api/onlineclient/client/register`,
                "POST",
                {
                    client: { ...client, clinica: auth.clinica._id },
                },
                {
                    Authorization: `Bearer ${auth.token}`,
                }
            );
            notify({
                title: t("Mijoz muvaffaqqiyatli yaratildi."),
                description: "",
                status: "success",
            });
            getConnectors(type)
            setModal(false);
            clearDatas();
            setVisible(false);
        } catch (error) {
            notify({
                title: t(`${error}`),
                description: "",
                status: "error",
            });
        }
    }, [
        auth,
        client,
        notify,
        request,
        indexLastConnector,
        indexFirstConnector,
        connectors,
        clearDatas,
    ]);

    const updateHandler = useCallback(async () => {
        if (checkClientData(client)) {
            return notify(checkClientData(client));
        }
        try {
            const data = await request(
                `/api/onlineclient/client/update`,
                "PUT",
                {
                    client: { ...client, clinica: auth.clinica._id },
                },
                {
                    Authorization: `Bearer ${auth.token}`,
                }
            );
            getConnectors(type);
            notify({
                title: `${data.lastname + " " + data.firstname
                    }  ${t("ismli mijoz ma'lumotlari muvaffaqqiyatl yangilandi.")}`,
                description: "",
                status: "success",
            });
            clearDatas();
            setVisible(false);
            setModal(false)
        } catch (error) {
            notify({
                title: t(`${error}`),
                description: "",
                status: "error",
            });
        }
    }, [
        auth,
        client,
        notify,
        request,
        clearDatas,
        getConnectors,
        beginDay,
        endDay,
    ]);

    const deleteHandler = useCallback(async () => {
        try {
            const data = await request(
                `/api/onlineclient/client/delete`,
                "POST",
                {
                    id: client._id,
                },
                {
                    Authorization: `Bearer ${auth.token}`,
                }
            );
            getConnectors(type);
            notify({
                title: `${data.lastname + " " + data.firstname
                    }  ${t("ismli mijoz ma'lumotlari muvaffaqqiyatl yangilandi.")}`,
                description: "",
                status: "success",
            });
            clearDatas();
            setVisible(false);
            setModal2(false)
        } catch (error) {
            notify({
                title: t(`${error}`),
                description: "",
                status: "error",
            });
        }
    }, [
        auth,
        client,
        notify,
        request,
        clearDatas,
        getConnectors,
        beginDay,
        endDay,
    ]);

    //====================================================================
    //====================================================================

    //====================================================================
    //====================================================================
    // ChangeDate

    const changeType = (e) => {
        setType(e.target.value)
        getConnectors(e.target.value)
    }

    //====================================================================
    //====================================================================
    // ChangeDate

    const changeStart = (e) => {
        setBeginDay(new Date(e));
        const search = [...searchStorage].filter(el => new Date(el.brondate).getTime() > new Date(new Date(e).setHours(0, 0, 0, 0)).getTime() && new Date(el.brondate).getTime() < new Date(new Date(e).setHours(23, 59, 59, 0)).getTime())
        setConnectors(search)
        setCurrentConnectors(search)
    };

    const changeEnd = (e) => {
        const date = new Date(
            new Date(new Date().setDate(new Date(e).getDate() + 1)).setUTCHours(
                0,
                0,
                0,
                0
            )
        );

        setEndDay(date);
        getConnectors(beginDay, date);
    };

    //====================================================================
    //====================================================================

    useEffect(() => {
        getConnectors(type);
    }, [getConnectors])

    //====================================================================
    //====================================================================
    return (
        <div>
            <div className="bg-slate-100 content-wrapper px-lg-5 px-3">
                <div className="row gutters">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="row">
                            <div className="col-12 text-end">
                                <button
                                    className={`btn bg-alotrade text-white mb-2 w-100 ${visible ? "d-none" : ""
                                        }`}
                                    onClick={changeVisible}
                                >
                                    {t("Registratsiya")}
                                </button>
                                <button
                                    className={`btn bg-alotrade text-white mb-2 w-100 ${visible ? "" : "d-none"
                                        }`}
                                    onClick={changeVisible}
                                >
                                    {t("Registratsiya")}
                                </button>
                            </div>
                        </div>
                        <div className={` ${visible ? "" : "d-none"}`}>
                            <div className="row gutters">
                                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                    <div className="card">
                                        <div className="card-header">
                                            <div className="card-title">{t("Mijozning shaxsiy ma'lumotlari")}</div>
                                        </div>
                                        <div className="card-body">
                                            <div className="row gutters">
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                                    <div className="form-group">
                                                        <label htmlFor="fullName">{t("Familiyasi")}</label>
                                                        <input
                                                            value={client?.lastname || ''}
                                                            onChange={changeClientData}
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            id="lastname"
                                                            name="lastname"
                                                            placeholder={t("Familiyasi")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                                    <div className="form-group">
                                                        <label htmlFor="inputEmail">{t("Ismi")}</label>
                                                        <input
                                                            value={client?.firstname || ''}
                                                            onChange={changeClientData}
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            id="firstname"
                                                            name="firstname"
                                                            placeholder={t("Ismi")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                                    <label htmlFor="education">{t("Kelish sanasi")}</label>
                                                    <input
                                                        onChange={(e) => changeClientBorn(e)}
                                                        type="datetime-local"
                                                        name="born"
                                                        className="form-control inp"
                                                        placeholder=""
                                                        style={{ color: '#999' }}
                                                        value={clientDate}
                                                    />
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                                    <div className="form-group">
                                                        <label htmlFor="addreSs">{t("Telefon raqami")}</label>
                                                        <div className="input-group input-group-sm mb-3">
                                                            <div className="input-group-prepend">
                                                                <span
                                                                    className="input-group-text"
                                                                    id="inputGroup-sizing-sm"
                                                                >
                                                                    +998
                                                                </span>
                                                            </div>
                                                            <input
                                                                value={client?.phone || ''}
                                                                onChange={changeClientData}
                                                                type="number"
                                                                className="form-control"
                                                                name="phone"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                                    <div className="text-right">
                                                        {loading ? (
                                                            <button className="bg-alotrade rounded text-white py-2 px-3" disabled>
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                                Loading...
                                                            </button>
                                                        ) : (
                                                            <button onClick={checkData} className="bg-alotrade rounded text-white py-2 px-3">
                                                                {t("Saqlash")}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="border-0 table-container">
                            <div className="border-0 table-container">
                                <div className="table-responsive">
                                    <div className="bg-white flex items-center p-2 gap-4">
                                        <div>
                                            <select
                                                className="form-control form-control-sm selectpicker"
                                                placeholder="Bo'limni tanlang"
                                                onChange={setPageSize}
                                                style={{ minWidth: "50px" }}
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                        <div>
                                            <input
                                                onChange={searchFullname}
                                                style={{ maxWidth: "100px", minWidth: "100px" }}
                                                type="search"
                                                className="w-100 form-control form-control-sm selectpicker"
                                                placeholder={t("F.I.O")}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                onChange={searchPhone}
                                                style={{ maxWidth: "100px", minWidth: "100px" }}
                                                type="search"
                                                className="w-100 form-control form-control-sm selectpicker"
                                                placeholder={t("Tel")}
                                            />
                                        </div>
                                        <div>
                                            <select
                                                className="form-control form-control-sm selectpicker"
                                                placeholder="Bo'limni tanlang"
                                                onChange={changeType}
                                            >
                                                <option value={'today'}>Royxat</option>
                                                <option value={'late'}>O'tganlar</option>
                                            </select>
                                        </div>
                                        <div className="text-center ml-auto">
                                            <Pagination
                                                setCurrentDatas={setCurrentConnectors}
                                                datas={connectors}
                                                setCurrentPage={setCurrentPage}
                                                countPage={countPage}
                                                totalDatas={connectors.length}
                                            />
                                        </div>
                                        <div
                                            className="text-center flex gap-2"
                                            style={{ maxWidth: "300px", overflow: "hidden" }}
                                        >
                                            <DatePickers changeDate={changeStart} />
                                        </div>
                                    </div>
                                    <table className="table m-0">
                                        <thead>
                                            <tr>
                                                <th className="border py-1 bg-alotrade text-[16px]">№</th>
                                                <th className="border py-1 bg-alotrade text-[16px]">
                                                    {t("F.I.O")}
                                                </th>
                                                <th className="border py-1 bg-alotrade text-[16px]">
                                                    {t("Tel")}
                                                </th>
                                                <th className="border py-1 bg-alotrade text-[16px]">
                                                    {t("Kelish sanasi")}
                                                </th>
                                                <th className="border py-1 bg-alotrade text-[16px]">
                                                    {t("Tahrirlash")}
                                                </th>
                                                <th className="border py-1 bg-alotrade text-[16px]">
                                                    {t("O'chirish")}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentConnectors.map((connector, key) => {
                                                return (
                                                    <tr key={key}>
                                                        <td
                                                            className="border py-1 font-weight-bold text-right"
                                                            style={{ maxWidth: "30px !important" }}
                                                        >
                                                            {currentPage * countPage + key + 1}
                                                        </td>
                                                        <td className="border py-1 font-weight-bold text-[16px]">
                                                            {connector.lastname +
                                                                " " +
                                                                connector.firstname}
                                                        </td>
                                                        <td className="border py-1 text-right text-[16px]">
                                                            +998{connector?.phone}
                                                        </td>
                                                        <td className="border py-1 text-right text-[16px]">
                                                            {new Date(connector?.brondate).toLocaleDateString('RU-ru')} {new Date(connector?.brondate).toLocaleTimeString('RU-ru')}
                                                        </td>
                                                        <td className="border py-1 text-center">
                                                            {loading ? (
                                                                <button className="btn btn-success" disabled>
                                                                    <span className="spinner-border spinner-border-sm"></span>
                                                                    Loading...
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-success py-0"
                                                                    onClick={() => {
                                                                        setClient({ ...client, ...connector })
                                                                        setClientDate(connector.brondate.slice(0, 16))
                                                                        setVisible(true)
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPenAlt} />
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="border py-1 text-center">
                                                            {loading ? (
                                                                <button className="btn btn-success" disabled>
                                                                    <span className="spinner-border spinner-border-sm"></span>
                                                                    Loading...
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-danger py-0"
                                                                    onClick={() => {
                                                                        setClient({ ...client, ...connector })
                                                                        setModal2(true)
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <CheckModal
                baseUrl={baseUrl}
                connector={check}
                modal={modal1}
                setModal={setModal1}
            /> */}

            <Modal
                modal={modal}
                text={t("ma'lumotlar to'g'ri kiritilganligini tasdiqlaysizmi?")}
                setModal={setModal}
                handler={client._id ? updateHandler : createHandler}
                basic={client.lastname + " " + client.firstname}
            />

            <Modal2
                modal={modal2}
                text={t("Malumotlarni o'chirishni tasdiqlaysizmi?")}
                setModal={setModal2}
                handler={client._id && deleteHandler}
            />
        </div>
    );
};
