import { useToast } from '@chakra-ui/react';
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { Navbar } from './components/Navbar';
import { useTranslation } from "react-i18next";

const Turns = () => {

    //=====================================================
    //=====================================================

    const {t} = useTranslation()

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

    //====================================================
    //====================================================

    const { request, loading } = useHttp();
    const auth = useContext(AuthContext);

    //=====================================================
    //=====================================================

    const [departmentsTurn, setDepartmentsTurn] = useState([])
    const [counter, setCounter] = useState(0)

    const getDepartmentsTurn = useCallback(
        async () => {
            try {
                const data = await request(
                    `/api/offlineclient/client/turns/get`,
                    "POST",
                    { clinica: auth && auth.clinica._id },
                    {
                        Authorization: `Bearer ${auth.token}`,
                    }
                );
                setDepartmentsTurn(data);
                setCounter(counter => counter + 1)
            } catch (error) {
                notify({
                    title: error,
                    description: "",
                    status: "error",
                });
            }
        },
        [request, auth, notify]
    );


    useEffect(() => {
        setTimeout(() => {
            getDepartmentsTurn()
        }, 3000)
    }, [counter])


    //=====================================================
    //=====================================================


    return (
        <>
            <Navbar />
            <div className='bg-white pt-[10px]'>
                <h1 className='text-[64px] font-bold text-center'>{t("NAVBAT")}</h1>
                <div className="min-h-full px-6 pt-[10px] pb-[100px] grid grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-8 bg-white">
                    {departmentsTurn.map((department, ind) => {
                        return <div className='col-span bg-white rounded-md flex flex-col items-center gap-2 py-4 border-[3px] border-alotrade' key={ind}>
                            <div className='w-full font-bold flex justify-center items-end'>
                                <p className='text-green-500 font-semibold text-[21px]'>{t("NAVBAT")}:</p>
                                <h1 className='ml-[10px] mr-[60px] text-green-500 text-[56px]'>
                                    {department?.turn}
                                </h1>
                            </div>
                            <div className='text-white w-full bg-alotrade'>
                                <p className='text-[32px] text-center font-bold'>{department?.name}</p>
                            </div>
                            <div className='text-black'>
                                <p className='text-[26px] font-semibold'>{t("Xona")}: {department?.room}</p>
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </>
    )
}

export default Turns