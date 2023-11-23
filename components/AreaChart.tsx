import { FC } from "react";
import { Line } from 'react-chartjs-2';
export interface CardProps {
    data: any[];
}
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, ScriptableContext, Filler, Tooltip } from 'chart.js'
import { Box } from "@chakra-ui/react";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Filler, Tooltip)

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
export const LineChart: FC<CardProps> = ({ data = [] }) => {
    // const data = data1[6]?.accountValueHistory ?? mockData
    // console.log(data1)
    const chartData = {
        labels: data.map((d: { date: string }) => new Date(d.date).toLocaleDateString()),
        datasets: [{
            data: data.map((d: { value: number }) => d.value),
            fill: 'origin',
            borderCapStyle: 'round' as const,
            cubicInterpolationMode: 'monotone' as const,
            backgroundColor: (context: ScriptableContext<"line">) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, "rgba(255, 237, 133, 0.3)");
                gradient.addColorStop(1, "rgba(255, 237, 133, 0)");
                return gradient;
            },
            borderColor: 'rgba(255, 237, 133, 1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 10,

        }],

    }

    return (
        <Box className="glowEffect" marginY={25} marginX={-500} boxShadow="xl" p={16} backgroundColor="rgb(53, 80, 65)" borderRadius={20}>
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
                                ticks: { color: 'white' }
                            },
                            y: {
                                type: 'linear',
                                ticks: {
                                    color: 'white',
                                    callback: function (value, index, values) {
                                        return '$' + value;
                                    }
                                }
                            }
                        },
                        plugins: {
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
        </Box>
    )
}
