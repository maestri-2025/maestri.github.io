// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/scatterplot
import {ResponsiveScatterPlot} from '@nivo/scatterplot'
import {getTheme} from '../utils/colorUtilities.ts';
import {Artist, Track} from '../utils/interfaces.ts';
import {Dropdown} from 'primereact/dropdown';
import {useEffect, useState} from 'react';
import {CountryDetails} from "../utils/mapUtilities.ts";
import {Button} from "primereact/button";

function ScatterPlot(props: {artist: Artist, currentTracks: Array<Track>, currentWeek: string, country: CountryDetails}) {

    if (props.currentTracks.length === 0) {
        return null;
    }

    // console.log(props)
    const axisOptions = [
        {
            label: "Team Size",
            computation: (track: Track) => track.credits.length
        },
        {
            label: "Charting Countries",
            computation: (track: Track) => (new Set(track.chartings.map((chart) => chart.country))).size
        },
        {
            label: "Peak Rank",
            computation: (track: Track, country: CountryDetails) => {
              return Math.min(...track.chartings
                .filter(chart => props.country.spotifyCode !== null ? chart.country === country.spotifyCode : true)
                .map(chart => chart.rank))
            }
        },
        {
            label: "Weeks on Chart",
            computation: (track: Track, country: CountryDetails) => {
              return Math.max(...track.chartings
                .filter(chart => props.country.spotifyCode !== null ? chart.country === country.spotifyCode : true)
                .map(chart => chart.weeks_on_chart))
            }
        }
    ]
    const [xAxis, setXAxis] = useState(axisOptions[0]);
    const [yAxis, setYAxis] = useState(axisOptions[1]);
    const [data, setData] = useState<{ id: string; data: { x: number; y: number; }[]; }[]>([]);

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
        // console.log("running effect", props, "data", data)
        setData(data)
        // console.log(buildData())
        // console.log(data)
    }, [xAxis, yAxis, props.country]);


    return (
        <div style={{height: '100%'}}>
          <div style={{height: "90%"}}>
            <ResponsiveScatterPlot
              data={data}
              margin={{ top: 25, right: 25, bottom: 70, left: 70 }}
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
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: xAxis.label,
                legendPosition: 'middle',
                legendOffset: 46,
                truncateTickAt: 0
              }}
              axisLeft={{
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
          <div className="flex flex-row" style={{maxHeight: "10%", gap: "1rem", padding: "0 0.5rem"}} >
            <Dropdown
              style={{ width: '100%'}}
              value={xAxis.label}
              onChange={(e) => setXAxis(e.value)}
              options={axisOptions}
              optionLabel="label"
              placeholder={xAxis.label}
              checkmark={true}
              highlightOnSelect={false}
            />
            <Button style={{padding: "0.75rem"}} onClick={() => {
              const tXAxis = xAxis;
              setXAxis(yAxis)
              setYAxis(tXAxis)

              console.log("HELLO")
            }} icon="pi pi-arrow-right-arrow-left" outlined tooltip="Switch Axis"/>
            <Dropdown
              style={{ width: '100%'}}
              value={yAxis.label}
              onChange={(e) => setYAxis(e.value)}
              options={axisOptions}
              optionLabel="label"
              placeholder={yAxis.label}
              checkmark={true}
              highlightOnSelect={false}
            />
          </div>
        </div>

    )
}

export default ScatterPlot;