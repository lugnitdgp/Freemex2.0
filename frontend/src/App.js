import React,{useState,useEffect} from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [stocks,setStocks]=useState([]);
  const [listening, setListening]= useState(false);
  // axios.get('http://localhost:8000/api/stocks').then((res)=>{
  //   console.log(res)
  // })
  useEffect(()=>{
    if(!listening)
    {
      const stocksData= new EventSource('http://localhost:8000/events');
      // console.log(stocksData)
      stocksData.onmessage=(newStocks)=>{
        const data= JSON.parse(newStocks.data);
        console.log(data)
        setStocks(data);
      };
      setListening(true);
    }
  },[listening,stocks]);
  return (
    <div className="App">
      
    </div>
  );
}

export default App;
