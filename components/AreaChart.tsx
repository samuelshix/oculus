import { FC } from "react";
import { Line } from 'react-chartjs-2';
export interface CardProps {
    data: any[];
}
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, TimeScale } from 'chart.js'
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale)

export const LineChart: FC<CardProps> = ({ data }) => {
    console.log(data)
    const chartData = {
        labels: data.map((d) => d.date),
        datasets: [{
            data: data.map((d) => d.value),
            fill: true,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,
        }]
    }

    return (
        <Line
            data={chartData}
        // options={{
        //     scales: {
        //         x: {
        //             type: 'time',
        //             time: {
        //                 unit: 'day',
        //                 displayFormats: {
        //                     day: 'MMM D'
        //                 }
        //             },
        //             ticks: {
        //                 source: 'labels'
        //             }
        //         },
        //         y: {
        //             ticks: {
        //             }
        //         }
        //     }
        // }}
        />
    )
}
