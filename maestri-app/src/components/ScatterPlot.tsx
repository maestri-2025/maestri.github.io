// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/scatterplot
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { getTheme } from '../utils/colorUtilities';
import { Artist, Track } from '../utils/interfaces';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import {CountryDetails, countryMappings} from "../utils/mapUtilities.ts";

function ScatterPlot(props: {artist: Artist, currentTracks: Array<Track>, currentWeek: string, country: CountryDetails}) {

    if (props.currentTracks.length === 0) {
        return null;
    }

    console.log(props)
    const axisOptions = [
        {
            label: "total credits",
            computation: (track: Track) => track.credits.length
        }, 
        {
            label: "total countries",
            computation: (track: Track) => (new Set(track.chartings.map((chart) => chart.country))).size
        },
        {
            label: "peak rank",
            computation: (track: Track, country: CountryDetails) => {
              return Math.max(...track.chartings
                .filter(chart => props.country.spotifyCode !== null ? chart.country === country.spotifyCode : true)
                .map(chart => chart.rank))
            }
        },
        {
            label: "peak number of weeks",
            computation: (track: Track, country: CountryDetails) => {
              return Math.max(...track.chartings
                .filter(chart => props.country.spotifyCode !== null ? chart.country === country.spotifyCode : true)
                .map(chart => chart.weeks_on_chart))
            }
        }
    ]
    const [xAxis, setXAxis] = useState(axisOptions[0]);
    const [yAxis, setYAxis] = useState(axisOptions[1]);
    const [data, setData] = useState([]);

    function buildData() {
      return props.currentTracks.map(track => (
        {
          id: track.name,
          data: [
            {
              "x": xAxis.computation(track, props.country),
              "y": yAxis.computation(track, props.country),
            }
          ]
        }
      ))
    }

    useEffect(() => {
        const data = buildData()
        console.log("running effect", props, "data", data)
        setData(data)
        // console.log(buildData())
        // console.log(data)
    }, [xAxis, yAxis, props.country])
    


    return (
        <div>
            <Dropdown
                style={{ width: '50%'}}
                value={xAxis.label}
                onChange={(e) => setXAxis(e.value)}
                options={axisOptions}
                optionLabel="label"
                placeholder={xAxis.label}
                checkmark={true}
                highlightOnSelect={false}
            />
            <Dropdown
                style={{ width: '50%'}}
                value={yAxis.label}
                onChange={(e) => setYAxis(e.value)}
                options={axisOptions}
                optionLabel="label"
                placeholder={yAxis.label}
                checkmark={true}
                highlightOnSelect={false}
            />
            <div style={{height: '50vh'}}>
            <ResponsiveScatterPlot
                data={data}
                margin={{ top: 50, right: 50, bottom: 100, left: 100 }}
                xScale={{ type: 'linear', min: 0, max: 'auto' }}
                xFormat=">-.2f"
                yScale={{ type: 'linear', min: 0, max: 'auto' }}
                yFormat=">-.2f"
                axisTop={null}
                axisRight={null}
                theme={getTheme()}
                colors={"#fbbf23"}
                useMesh={false}
                axisBottom={{
                    orient: 'bottom',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: xAxis.label,
                    legendPosition: 'middle',
                    legendOffset: 46,
                    truncateTickAt: 0
                }}
                axisLeft={{
                    orient: 'left',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: yAxis.label,
                    legendPosition: 'middle',
                    legendOffset: -60,
                    truncateTickAt: 0
                }}
                // legends={[
                //     {
                //         anchor: 'bottom-right',
                //         direction: 'column',
                //         justify: false,
                //         translateX: 130,
                //         translateY: 0,
                //         itemWidth: 100,
                //         itemHeight: 12,
                //         itemsSpacing: 5,
                //         itemDirection: 'left-to-right',
                //         symbolSize: 12,
                //         symbolShape: 'circle',
                //         effects: [
                //             {
                //                 on: 'hover',
                //                 style: {
                //                     itemOpacity: 1
                //                 }
                //             }
                //         ]
                //     }
                // ]}
            />
            </div>

        </div>

    )
}

export default ScatterPlot;