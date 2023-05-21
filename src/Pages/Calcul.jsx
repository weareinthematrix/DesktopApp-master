import { invoke } from "@tauri-apps/api";
import React, { useState } from "react";

function App() {
  const [inputValues, setInputValues] = useState({"exp-te-sec":'',"exp-te-rri":'',"exp-ts-sec":'',"exp-ts-rri":'',"exp-debit-sec":'',"exp-debit-rri":''});   
    const [displayedValues, setDisplayedValues] = useState({"k": NaN,"e":"inconnu","ea":NaN,"me":NaN});
    const [errorCalcul, setErrorCalcul] = useState(false);
    const [isDataLogged, setIsDataLogged] = useState(false);
    function updateInputVal(name, value){
        let copyDict = {};
        Object.assign(copyDict, inputValues);
        copyDict[name] = value;
        setInputValues(copyDict);
    }
    function calculer(){
        setErrorCalcul(false);
        if(inputValues["exp-te-sec"] === "" || inputValues["exp-te-rri"] === "" || inputValues["exp-ts-sec"] === "" || inputValues["exp-ts-rri"]=="" || inputValues["exp-debit-sec"] === "" || inputValues["exp-debit-rri"] === ""){
            console.log("erreur");
            setErrorCalcul(true);
            return;
        }
        let teSec, teRri, tsSec, tsRri, debitSec, debitRri;
        try {
            teSec = parseFloat(inputValues["exp-te-sec"]);
            teRri = parseFloat(inputValues["exp-te-rri"]);
            tsSec = parseFloat(inputValues["exp-ts-sec"]);
            tsRri = parseFloat(inputValues["exp-ts-rri"]);
            debitSec = parseFloat(inputValues["exp-debit-sec"]);
            debitRri = parseFloat(inputValues["exp-debit-rri"]);
        } catch (error) {
            setErrorCalcul(true);
        }
        if(isNaN(teSec) || isNaN(teRri) || isNaN(tsSec) || isNaN(tsRri) || isNaN(debitSec) || isNaN(debitRri)){
            setErrorCalcul(true);
        }
        if(errorCalcul === true){
            return;
        }
        

        // let tmRri = (teRri + tsRri) / 2;
        // let tmSec = (teSec + tsSec) / 2;

        //Note, les calculs ne sont pas bons, voir le fichier excel, faire attention, il y a deux echangeurs sur une voie, min des deux
        //TODO check les erreurs cote rust pour entrer les valeurs
        let s = 1326.0;//Surface echangeur
        let Cp = 4.18;
        let pSec = debitSec * Cp * Math.abs(tsSec - teSec);
        let pRri = debitRri * Cp * Math.abs(teRri - tsRri);
        let Kpn = 3.77;
        let alpha = 0.31;
        let beta = 0.31;
        let gamma = 0.38;
        let qnSec = 1000.0;
        let qnRri = 805.0;
        let copyDict = {};
        Object.assign(copyDict, displayedValues);
        let k = (pSec + pRri)/(s*(teRri + tsRri - teSec - tsSec));
        copyDict["k"] = k;
        let kRequis = 1/((s*(tsRri - teSec)/pRri) + s/(2*Cp)*(1/debitRri - 1/debitSec)); //coefficient d'échange requis pour dissiper la chaleur
        let kp = 1/((1/Kpn)*(alpha*(qnSec/debitSec) + beta*(qnRri/debitRri) + gamma));//Coefficient d'échange à l'etat propre
        let e = (1/k) - (1/kp);
        copyDict["e"] = e;
        let ea = (1/kRequis) - (1/kp);
        copyDict["ea"] = ea;
        copyDict["me"] = ea - e;
        setDisplayedValues(copyDict);
        

    }

    function enregistrer(){
        if(isNaN(displayedValues["k"]) === true || errorCalcul === true){
            console.log("zeb")
            return;
        }
        invoke("add_row", {date : parseInt(new Date().getTime() / 1000), 
            teSec : inputValues["exp-te-sec"], 
            teRri : inputValues["exp-te-rri"],  
            tsSec : inputValues["exp-ts-sec"], 
            tsRri : inputValues["exp-ts-rri"], 
            debitSec : inputValues["exp-debit-sec"], 
            debitRri : inputValues["exp-debit-rri"], 
            k : displayedValues["k"].toString(),
            e : displayedValues["e"].toString(), 
            ea : displayedValues["ea"].toString(), 
            me : displayedValues["me"].toString()
        }).then((result) => {setIsDataLogged(true)});
        

        console.log("Ouais");
    }

  return (
    <>
      <h1 className="text-3xl text-center">Calcul en exploitation</h1>
      <p className="m-t-20 mx-50 bg-sky-100 p-4 my-4 rounded-lg">
        Veuillez renseigner toutes les valeurs puis cliquer sur <strong>Calculer</strong>. Vous verrez alors les différentes grandeurs calculées. Pour enregistrer ces mesures, cliquez sur <strong>Enregistrer</strong>. N'indiquez pas les unités dans la zone de saisie. Pour les puissances de 10, utilisez la notation 5.6E-3 et pour les nombres décimaux, merci d'utiliser un <strong>.</strong>.
      </p>
      <div className="exp-form-container grid grid-cols-2 mb-6">
        <p className="exp-te-sec my-2">Température d'entrée SEC: <input className="border-2 rounded-md border-g400" name="exp-te-sec" onChange={(e) => { updateInputVal("exp-te-sec", e.target.value) }} /> °C</p>
        <p className="exp-te-rri my-2">Température d'entrée RRI: <input className="border-2 rounded-md border-g400" name="exp-te-rri" onChange={(e) => { updateInputVal("exp-te-rri", e.target.value) }} /> °C</p>

        <p className="exp-ts-sec my-2">Température de sortie SEC: <input className="border-2 rounded-md border-g400" name="exp-ts-sec" onChange={(e) => { updateInputVal("exp-ts-sec", e.target.value) }} /> °C</p>
        <p className="exp-ts-rri my-2">Température de sortie RRI: <input className="border-2 rounded-md border-g400" name="exp-ts-rri" onChange={(e) => { updateInputVal("exp-ts-rri", e.target.value) }} /> °C</p>

        <p className="exp-debit-sec my-2">Débit SEC: <input className="border-2 rounded-md border-g400" name="exp-debit-sec" onChange={(e) => { updateInputVal("exp-debit-sec", e.target.value) }} /> kg/sec</p>
        <p className="exp-debit-rri my-2">Débit RRI: <input className="border-2 rounded-md border-g400" name="exp-debit-rri" onChange={(e) => { updateInputVal("exp-debit-rri", e.target.value) }} /> kg/sec</p>


      </div>
      <div className="exp-btn-container flex justify-center">
        <div className="btn" onClick={() => { calculer() }}>
          <span className="mx-auto">Calculer</span>
        </div>
        <div className="btn">
          <span className="mx-auto" onClick={() => { enregistrer() }}>Enregistrer</span>
        </div>
      </div>
      <div className="exp-results">
        <p className="exp-val">
          K : <strong>{isNaN(displayedValues["k"]) ? "inconnu" : displayedValues["k"].toString().substring(0, 5)}</strong> W.m^-2°C (coefficient d'échange )<br />
          E : <strong>{isNaN(displayedValues["e"]) ? "inconnu" : displayedValues["e"].toString().substring(0, 5)}</strong> m².°C.W^-1 (encrassement du moment)<br />
          Ea : <strong>{isNaN(displayedValues["ea"]) ? "inconnu" : displayedValues["ea"].toString().substring(0, 5)}</strong> m².°C.W^-1 (encrassement admissible)<br />
          <span className={(!isNaN(displayedValues["me"]) && displayedValues["me"] < 0.1) ? "text-red-500" : undefined}>Marge à l'encrassement : <strong>{isNaN(displayedValues["me"]) ? "inconnu" : displayedValues["me"].toString().substring(0, 5)}</strong> m².°C.W^-1 </span>
          <br />
        </p>
        {errorCalcul === true && <p className="bg-red-200 p-4 mt-4 rounded-lg">Un probleme est survenu lors du calcul, veuillez vérifier les paramètres en entrée</p>}
        {isDataLogged === true && <p className="m-t-20 mx-50 bg-sky-100 p-4 my-4 rounded-l">Valeurs enregistrées </p>}
      </div></>
  );
}

export default App;
