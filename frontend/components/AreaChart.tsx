import { FC } from "react";
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, ScriptableContext, Filler, Tooltip, Title } from 'chart.js'
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Filler, Tooltip, Title)

export interface CardProps {
    data1: any[];
}

const mockData = [
    {
        "date": "2023-11-08T00:00:00.000Z",
        "price": 54.20703091890225,
        "balance": 16.017501424,
        "value": 868.2611949343287
    },
    {
        "date": "2023-11-09T00:00:00.000Z",
        "price": 56.41862098888671,
        "balance": 16.017501424,
        "value": 903.685342029609
    },
    {
        "date": "2023-11-10T00:00:00.000Z",
        "price": 70.92329990446574,
        "balance": 16.017501424,
        "value": 1136.014057214559
    },
    {
        "date": "2023-11-11T00:00:00.000Z",
        "price": 70.59407354179874,
        "balance": 16.017501424,
        "value": 1130.7406734817218
    },
    {
        "date": "2023-11-12T00:00:00.000Z",
        "price": 70.07199709925627,
        "balance": 16.017501424,
        "value": 1122.378313319861
    },
    {
        "date": "2023-11-13T00:00:00.000Z",
        "price": 65.22348358198929,
        "balance": 16.017501424,
        "value": 1044.717241152754
    },
    {
        "date": "2023-11-14T00:00:00.000Z",
        "price": 71.38941772187049,
        "balance": 16.017501424,
        "value": 1143.4801000185912
    }
]
export const LineChart: FC<CardProps> = ({ data1 = [] }) => {
    // const data = data1[6]?.accountValueHistory ?? mockData
    // console.log(data1)
    const data = data1.length > 0 ? data1 : mockData
    const chartData = {
        labels: data.map((d: { date: string }) => new Date(d.date).toLocaleDateString()),
        datasets: [{
            data: data.map((d: { value: number }) => d.value),
            fill: 'origin',
            label: 'Portfolio Value',
            borderCapStyle: 'round' as const,
            cubicInterpolationMode: 'monotone' as const,
            backgroundColor: (context: ScriptableContext<"line">) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, "rgba(245, 235, 221,.3)");
                gradient.addColorStop(1, "rgb(245, 235, 221, 0)");
                return gradient;
            },
            borderColor: 'rgb(245, 235, 221)',
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,

        }],

    }

    return (
        <Line
            data={chartData}
            width={800}
            height={400}
            options={
                {
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { color: 'rgb(245, 235, 220)' }
                        },
                        y: {
                            type: 'linear',
                            ticks: {
                                color: 'rgb(245, 235, 220)',
                                callback: function (value, index, values) {
                                    return '$' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Portfolio Value',
                            color: 'rgb(245, 235, 220)',
                            font: {
                                size: 20,
                                weight: 'bold'
                            }
                        },
                        tooltip: {
                            displayColors: false,
                            callbacks: {
                                label: (yDatapoint) => { return "$" + yDatapoint.formattedValue },
                            },
                            enabled: true,
                        }
                    },
                }}
        />
    )
}
