import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

function Graph({dataArray, dataName}){
    const [graphArray, setGraphArray] = useState([]);
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(0);
    
    const DataFormater = (number) => {
        return number.toFixed(5);
    }

    useEffect(() => {
        let newArr = [];
        let dict = {};
        setMinValue(dataArray[0][0]);
        setMaxValue(dataArray[0][0]);
        let dateFormatted;
        for (let i = 0; i < dataArray.length; i++) {
            dict = {
                "date" : dateFormatted,
                "val" : parseFloat(dataArray[i][1])
            }
            newArr.push(dict);

            dateFormatted = new Date(parseInt(dataArray[i][0])*1000).toLocaleString("fr-FR");
            if(minValue > parseFloat(dataArray[i][0])){
                setMinValue(dataArray[i][0]);
            }
            if(maxValue < parseFloat(dataArray[i][0])){
                setMinValue(dataArray[i][0]);
            }
                 
        }
        setGraphArray(newArr);
    }, [dataArray])
    
    return (
        
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
            width={500}
            height={300}
            data={graphArray}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[minValue - 0.1 * (maxValue - minValue), maxValue] + 0.1 * (maxValue - minValue)} tickFormatter={DataFormater}/>
            <Tooltip isAnimationActive={false}/>
            <Legend/>
            <Line name={dataName} type="monotone" dataKey="val" stroke="#8884d8" isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
        
    );
}

export default Graph;