import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import Graph from "./Graph";

function App() {
    
    const [selectedData, setSelectedData] = useState("te_rri");
    const [selectedDate, setSelectedDate] = useState("");
    const [dataArray, setDataArray] = useState([]);
    const [graphLabel, setGraphLabel] = useState("");

    const params = {
        "te_rri" : "Température d'entrée RRI",
        "te_sec" : "Température d'entrée SEC",
        "ts_rri" : "Température de sortie RRI",
        "ts_sec" : "Température de sortie SEC",
        "debit_rri" : "Débit RRI",
        "debit_sec" : "Débit SEC",
        "k" : "Coefficient d'échange",
        "e" : "Encrassement",
        "ea" : "Encrassement admissible",
        "me" : "Marge à l'encrassement"
    };

    function plotData(){
        if(selectedData === "" || selectedDate === ""){
            return;
        }
        console.log("Hello")
        let localDate = new Date(selectedDate);
        let isoString = localDate.toISOString()
        let timeStamp = parseInt(new Date(isoString).getTime()/1000);
        invoke("get_data", {dateMin : timeStamp, param : selectedData}).then((result) => {setDataArray(result);setGraphLabel(params[selectedData])});//get_data(date_min : usize, param : String)

    }
    useEffect(() => {
        console.log(dataArray);
    }, [dataArray]);

    return (
        <>
            <React.StrictMode>
                <h1 className="text-3xl text-center">Evolution</h1>
                <div className="flex mt-4 justify-center">
                    <div className="flex flex-col mr-4">
                        <div className="flex my-2">
                            <p>Type de données : </p>
                            <select id="type-donnee" className="border-2 rounded-md border-g400" onChange={(e) => { setSelectedData(e.target.value) }}>
                                {
                                    Object.keys(params).map((key, index) => (
                                        <option key={key} value={key}>{params[key]}</option>
                                    )
                                    )
                                }

                            </select>
                        </div>
                        <div className="flex my-2">
                            <p>A partir de : </p>
                            <input id="date-debut" type="datetime-local" name="date-debut" className="border-2 rounded-md border-g400" onChange={(e) => { setSelectedDate(e.target.value) }} />
                        </div>

                    </div>
                    <div className="btn my-auto ml-4">
                        <span className="mx-auto" onClick={() => { plotData() }}>Obtenir</span>
                    </div>


                </div>
                <section className="w-[60vw] h-[50vh] mx-auto mt-6">
                    {dataArray.length >= 2 && <Graph dataArray={dataArray} dataName={graphLabel} />}
                </section>

            </React.StrictMode>
        </>
    );
}

export default App;
