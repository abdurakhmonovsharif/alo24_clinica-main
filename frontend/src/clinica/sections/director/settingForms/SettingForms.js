import { FormControl, FormLabel, Switch } from "@chakra-ui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { receptionSettingForm } from "./inputs.data";
import { AuthContext } from "../../../context/AuthContext";
import { useHttp } from "../../../hooks/http.hook";
import { t } from "i18next";

const SettingForms = () => {
  const auth = useContext(AuthContext);
  const [requiredFields, setRequiredFieds] = useState(null);
  const [cashNavigate, setCashNavigate] = useState(false);
  const [connectorDoctor_client, setConnectorDoctor_client] = useState(false);
  const { request, loading } = useHttp();
  useEffect(() => {
    getRequiredFields();
    getConnectorDoctor();
    getReseptionPayAccess();
  }, []);
  //====================================================================
  //====================================================================
  // Required Fields
  const getRequiredFields = useCallback(async () => {
    try {
      const data = await request(
        `/api/clinica/requiredFields/${auth.clinica._id}`,
        "GET",
        null
      );
      setRequiredFieds(data.requiredFields);
    } catch (error) {
      // notify({
      //   title: t(`${error}`),
      //   description: "",
      //   status: "error",
      // });
    }
  });
  // Required Fields
  const getReseptionPayAccess = useCallback(async () => {
    try {
      const { reseption_and_pay } = await request(
        `/api/clinica/reseption_pay/${auth.clinica._id}`,
        "GET",
        null
      );
      setCashNavigate(reseption_and_pay);
    } catch (error) {
      // notify({
      //   title: t(`${error}`),
      //   description: "",
      //   status: "error",
      // });
    }
  });
  const getConnectorDoctor = useCallback(async () => {
    try {
      const { connectorDoctor_client } = await request(
        `/api/clinica/connector_doctor_has/${auth.clinica._id}`,
        "GET",
        null
      );
      setConnectorDoctor_client(connectorDoctor_client);
    } catch (error) {
      // notify({
      //   title: t(`${error}`),
      //   description: "",
      //   status: "error",
      // });
    }
  });

  const handleChangeReceptionFormSwitch = async (name, value) => {
    try {
      await request(
        `/api/clinica/requiredFields/${auth.clinica._id}`,
        "PATCH",
        { requiredFields: { ...requiredFields, [name]: value } }
      );
      getRequiredFields();
    } catch (error) {
      console.log(error);
      // notify({
      //   title: t(`${error}`),
      //   description: "",
      //   status: "error",
      // });
    }
  };
  const handleChangeReceptionPaySwitch = async (value) => {
    try {
      await request(`/api/clinica/reseption_pay/${auth.clinica._id}`, "PATCH", {
        reseption_and_pay: value,
      });
      getReseptionPayAccess();
    } catch (error) {
      console.log(error);
      // notify({
      //   title: t(`${error}`),
      //   description: "",
      //   status: "error",
      // });
    }
  };
  const handleChangeReceptionConnectorDoctorHasSwitch = async (value) => {
    try {
      await request(
        `/api/clinica/connector_doctor_has/${auth.clinica._id}`,
        "PATCH",
        {
          connectorDoctor_client: value,
        }
      );
      getConnectorDoctor();
    } catch (error) {
      console.log(error);
      // notify({
      //   title: t(`${error}`),
      //   description: "",
      //   status: "error",
      // });
    }
  };
  return (
    <div className="container-fluid">
      <div className="pb-6 pt-4 col-xl-4 border-r borer-4">
        <h1 className="text-center font-semibold text-lg mb-3">
          Qabulxona sozlamalari
        </h1>
        <span className="font-medium">
          Mijoz ro'yxatdan o'tkazish sozlamalari
        </span>
        <ul className="my-2 ml-2">
          {receptionSettingForm.map((item) => (
            <li key={item.key} className="border-b py-1">
              <FormControl
                display="flex"
                alignItems="center"
                justifyContent={"space-between"}
                onChange={({ target }) =>
                  handleChangeReceptionFormSwitch(
                    item.input_name,
                    target.checked
                  )
                }
              >
                <FormLabel htmlFor="email-alerts" mb="0">
                  {item.name}
                </FormLabel>
                <Switch
                  disabled={loading}
                  isChecked={
                    !requiredFields ? true : requiredFields[item.input_name]
                  }
                  id={item.input_name}
                />
              </FormControl>
            </li>
          ))}
        </ul>
        <span className="font-medium">Qabulda kassaga yo'naltirish</span>
        <ul className="my-2 ml-2">
          <li className="border-b py-1">
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent={"space-between"}
              onChange={({ target }) =>
                handleChangeReceptionPaySwitch(target.checked)
              }
            >
              <FormLabel htmlFor="email-alerts" mb="0">
                Yo'naltirish
              </FormLabel>
              <Switch
                disabled={loading}
                isChecked={cashNavigate}
                id={"cashNavigate"}
              />
            </FormControl>
          </li>
        </ul>
        <span className="font-medium">Yo'nlanma shifokor</span>
        <ul className="mt-2 ml-2">
          <li className="border-b py-1">
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent={"space-between"}
              onChange={({ target }) =>
                handleChangeReceptionConnectorDoctorHasSwitch(target.checked)
              }
            >
              <FormLabel htmlFor="email-alerts" mb="0">
                Ochish
              </FormLabel>
              <Switch
                disabled={loading}
                isChecked={connectorDoctor_client}
                id={"connectorDoctor_client"}
              />
            </FormControl>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SettingForms;
