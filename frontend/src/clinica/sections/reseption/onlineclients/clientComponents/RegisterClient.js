import React, { useCallback, useEffect, useState } from "react";
import { DatePickers } from "./DatePickers";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useTranslation } from "react-i18next";
const animatedComponents = makeAnimated();

export const RegisterClient = ({
  checkData,
  client,
  changeClientData,
  changeClientBorn,
  departments,
  setModal,
  loading,
  clientDate
}) => {

  const { t } = useTranslation()

  const [services, setServices] = useState([]);
  const getServices = useCallback(
    (e) => {
      var s = [];
      if (e === "all") {
        departments.map((department) => {
          return department.services.map((service) => {
            return s.push({
              label: service.name,
              value: service._id,
              service: service,
              department: department,
            });
          });
        });
      } else {
        departments.map((department) => {
          if (e === department._id) {
            department.services.map((service) => {
              s.push({
                label: service.name,
                value: service._id,
                service: service,
                department: department,
              });
              return "";
            });
          }
          return "";
        });
      }
      setServices(s);
    },
    [departments]
  );

  useEffect(() => {
    if (departments) {
      getServices("all");
    }
  }, [departments, getServices]);
  return (
    <>
      {/* Row start */}
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
                  {/* <DatePickers
                    dateFormat="dd/MM/yyyy"
                    changeDate={changeClientBorn}
                  /> */}
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
                <div className="col-12">
                  <div className="form-group">
                    <label htmlFor="fullName">{t("Bo'limlar")}</label>
                    <select
                      className="form-control form-control-sm selectpicker"
                      placeholder="Reklamalarni tanlash"
                      onChange={changeClientData}
                      name="department"
                      value={client?.department}
                    >
                      <option value="all"> {t("Barcha bo'limlar")}</option>
                      {departments.map((department, index) => {
                        return (
                          <option key={index} value={department._id}>
                            {department.name}
                          </option>
                        );
                      })}
                    </select>
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
      {/* Row end */}
    </>
  );
};
