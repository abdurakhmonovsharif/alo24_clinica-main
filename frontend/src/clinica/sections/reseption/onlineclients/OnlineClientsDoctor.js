import { useToast } from "@chakra-ui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useHttp } from "../../../hooks/http.hook";
import { Modal, Modal as Modal2 } from "../components/Modal";
import { RegisterClient } from "./clientComponents/RegisterClient";
import { TableClients } from "./clientComponents/TableClients";
import {
  checkClientData,
  checkProductsData,
  checkServicesData,
} from "./checkData/checkData";
import { CheckModal } from "../components/ModalCheck";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faPenAlt,
  faRotate,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { DatePickers } from "./clientComponents/DatePickers";
import { Pagination } from "../components/Pagination";

export const OnlineClientsDoctor = () => {
  const [beginDay, setBeginDay] = useState(new Date().toISOString());
  const [endDay, setEndDay] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  //====================================================================
  //====================================================================

  const {
    state: { doctor },
  } = useLocation();

  const history = useHistory();

  //====================================================================
  //====================================================================
  // MODAL
  const [modal, setModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [modal2, setModal2] = useState(false);
  //====================================================================
  //====================================================================
  const { t } = useTranslation();
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

  const [type, setType] = useState("today");

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
          {
            clinica: auth && auth.clinica._id,
            department: doctor?.specialty?._id,
            beginDay: new Date(),
            type,
          },
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
  };

  const searchPhone = (e) => {
    const searching = searchStorage.filter((item) =>
      item.phone.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setConnectors(searching);
    setCurrentConnectors(searching.slice(0, countPage));
  };
  //====================================================================
  //====================================================================

  //====================================================================
  //====================================================================
  const setPageSize = (e) => {
    setCurrentPage(0);
    setCountPage(e.target.value);
    setCurrentConnectors(connectors.slice(0, countPage));
  };
  //====================================================================
  //====================================================================

  //====================================================================
  //====================================================================
  // BASEURL
  const [baseUrl, setBaseurl] = useState();

  const getBaseUrl = useCallback(async () => {
    try {
      const data = await request(`/api/baseurl`, "GET", null);
      setBaseurl(data);
    } catch (error) {
      notify({
        title: t(`${error}`),
        description: "",
        status: "error",
      });
    }
  }, [request, notify]);

  //====================================================================
  //====================================================================

  //====================================================================
  //====================================================================
  // CLIENT

  const [client, setClient] = useState({
    clinica: auth.clinica && auth.clinica._id,
    reseption: auth.user && auth.user._id,
  });

  const changeClientData = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const [clientDate, setClientDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const changeClientBorn = (e) => {
    setClientDate(e.target.value);
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
      getConnectors(type);
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
        title: `${data.lastname + " " + data.firstname}  ${t(
          "ismli mijoz ma'lumotlari muvaffaqqiyatl yangilandi."
        )}`,
        description: "",
        status: "success",
      });
      clearDatas();
      setVisible(false);
      setModal(false);
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
        title: `${data.lastname + " " + data.firstname}  ${t(
          "ismli mijoz ma'lumotlari muvaffaqqiyatl yangilandi."
        )}`,
        description: "",
        status: "success",
      });
      clearDatas();
      setVisible(false);
      setModal2(false);
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

  const changeType = (e) => {
    setType(e.target.value);
    getConnectors(e.target.value);
  };

  //====================================================================
  //====================================================================
  // ChangeDate

  const changeStart = (e) => {
    setBeginDay(new Date(e));

    const search = [...searchStorage].filter(
      (el) =>
        new Date(el.brondate).getTime() >
          new Date(new Date(e).setHours(0, 0, 0, 0)).getTime() &&
        new Date(el.brondate).getTime() <
          new Date(new Date(e).setHours(23, 59, 59, 0)).getTime()
    );
    setConnectors(search);
    setCurrentConnectors(search);
  };

  // const changeEnd = (e) => {
  //     const date = new Date(
  //         new Date(new Date().setDate(new Date(e).getDate() + 1)).setUTCHours(
  //             0,
  //             0,
  //             0,
  //             0
  //         )
  //     );

  //     setEndDay(date);
  //     getConnectors(beginDay, date);
  // };

  //====================================================================
  //====================================================================

  const [departments, setDepartments] = useState([]);

  const getDepartments = useCallback(async () => {
    try {
      const data = await request(
        `/api/services/department/reseption`,
        "POST",
        { clinica: auth.clinica._id },
        {
          Authorization: `Bearer ${auth.token}`,
        }
      );
      setDepartments(data);
    } catch (error) {
      notify({
        title: t(`${error}`),
        description: "",
        status: "error",
      });
    }
  }, [request, auth, notify]);

  //====================================================================
  //====================================================================
  // useEffect
  const [s, setS] = useState(0);

  useEffect(() => {
    if (auth.clinica && !s) {
      setS(1);
      getDepartments();
      getBaseUrl();
    }
  }, [auth, s, getDepartments, getBaseUrl, beginDay, endDay]);

  useEffect(() => {
    if (doctor) {
      getConnectors(type);
    }
  }, [getConnectors]);

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
                  className={`btn bg-alotrade text-white mb-2 w-100 ${
                    visible ? "d-none" : ""
                  }`}
                  onClick={changeVisible}
                >
                  {t("Registratsiya")}
                </button>
                <button
                  className={`btn bg-alotrade text-white mb-2 w-100 ${
                    visible ? "" : "d-none"
                  }`}
                  onClick={changeVisible}
                >
                  {t("Registratsiya")}
                </button>
              </div>
            </div>
            <div className={` ${visible ? "" : "d-none"}`}>
              <RegisterClient
                updateData={updateHandler}
                checkData={checkData}
                client={client}
                setClient={setClient}
                changeClientData={changeClientData}
                changeClientBorn={changeClientBorn}
                departments={departments}
                loading={loading}
                setModal={setModal}
                clientDate={clientDate}
              />
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
                        <option value={"today"}>Royxat</option>
                        <option value={"late"}>O'tganlar</option>
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
                        <th className="border py-1 bg-alotrade text-[16px]">
                          №
                        </th>
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
                          {t("Qo'shish")}
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
                              {connector.lastname + " " + connector.firstname}
                            </td>
                            <td className="border py-1 text-right text-[16px]">
                              +998{connector?.phone}
                            </td>
                            <td className="border py-1 text-right text-[16px]">
                              {new Date(connector?.brondate).toLocaleDateString(
                                "RU-ru"
                              )}{" "}
                              {new Date(connector?.brondate).toLocaleTimeString(
                                "RU-ru"
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
                                  className="btn btn-warning py-0"
                                  onClick={() => {
                                    history.push("/alo24", {
                                      onlineclient: connector,
                                    });
                                  }}
                                >
                                  <FontAwesomeIcon icon={faRotate} />
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
                                  className="btn btn-success py-0"
                                  onClick={() => {
                                    setClient({ ...client, ...connector });
                                    setClientDate(
                                      connector.brondate.slice(0, 16)
                                    );
                                    setVisible(true);
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
                                    setClient({ ...client, ...connector });
                                    setModal2(true);
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
