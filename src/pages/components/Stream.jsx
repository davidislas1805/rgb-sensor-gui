import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import StreamingPlugin from "chartjs-plugin-streaming";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  StreamingPlugin,
);

const data_layout = {
  datasets: [
    {
      label: "Red",
      backgroundColor: '#f44336',
      borderColor: '#f44336',
      cubicInterpolationMode: "monotone",
      fill: true,
      data: []
    },
    {
      label: "Green",
      backgroundColor: '#04AA6D',
      borderColor: '#04AA6D',
      cubicInterpolationMode: "monotone",
      fill: true,
      data: []
    },
    {
      label: "Blue",
      backgroundColor: '#2196F3',
      borderColor: '#2196F3',
      cubicInterpolationMode: "monotone",
      fill: true,
      data: []
    }
  ]
};

const chart_options = {
  scales: {
    x: {
      type: "realtime",
      realtime: {
        delay: 2000,
      }
    },
    yAxes: {
      min: 0,
      max: 255
    },
  },
  tooltips: {
    mode: 'nearest',
    intersect: true,
    position: 'average'
  },
  maintainAspectRatio: false
}

export default function Stream({serial_data}) {  
  data_layout.datasets.forEach((dataset, index) => {
    dataset.data.push({
      x: Date.now(),
      y: serial_data[index]
    })
  });
  let chart = <Line data = {data_layout} options = {chart_options}/>
  return (
    chart
  );
}