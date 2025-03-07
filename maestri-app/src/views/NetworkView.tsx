import { ComputedNode } from '@nivo/network'
import {useState} from "react";
import { DataModel } from '../DataModel';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Artist, NetworkNode, Track } from '../utils/interfaces';
import NetworkChart from '../components/NetworkChart';
import { DataScroller } from 'primereact/datascroller';
import { Panel } from 'primereact/panel';
import { Chip } from 'primereact/chip';
import { Tooltip } from 'primereact/tooltip';
import { getColorPalette } from '../utils/colorUtilities';



function Network(props: { readonly model: DataModel }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const selectedArtistId = searchParams.get("id") || "1405";

    const allArtists = props.model.getArtists();
    const [artist, setArtist] = useState(props.model.getArtist(selectedArtistId));
    const history = (searchParams.get("history") == "" ? undefined : searchParams.get("history"))?.split(",") || [];

  const artistItemTemplate = (node: NetworkNode) => {
    const collaborator = props.model.getArtist(node.id)
    const collaboratorImageLink = collaborator.image_url

    const collaborationsIds = props.model.getCollaborations(artist, collaborator)
    const collaborationsIdSet = new Set(collaborationsIds)
    const collaborations = props.model.getSpecificTracks(collaborationsIds)
    const contributionTypesCounts = Array.from(collaborator.contributions.filter((c) => collaborationsIdSet.has(String(c.song_id))).map((c) => c.type).reduce((acc, e) => (acc.set(e, 1 + (acc.get(e) || 0))), new Map<string, number>).entries())

    return (
      <Panel header={
        <div>
          <div className="flex flex-row" style={{ fontSize: "150%", marginBottom: 2 }}>{collaborator.name}</div>
          <div className="flex flex-row">
            <img style={{
              width: 75,
              height: 75,
            }} src={collaboratorImageLink} alt={collaborator.name} />
            <div>
              {
                contributionTypesCounts.map(([type, count]: [string, number]) => {
                  return <Chip className={`chip-${type}-${collaborator.artist_id}`} style={{ fontSize: "70%", margin: 1 }} label={`${type}: ${count}`} />
                })
              }
              {
                contributionTypesCounts.map(([type, _]: [string, number]) => {
                  return <Tooltip target={`.chip-${type}-${collaborator.artist_id}`} content={`How many ${type} credits ${collaborator.name} has on songs that ${artist.name} has contributed to`} />
                })
              }
            </div>
          </div>
        </div>
      } toggleable collapsed={true} >
        <div className="flex flex-col" style={{ gap: "1rem", overflowY: 'scroll', height: "30vh" }}>
          {collaborations.map((c) => trackDisplay(c, collaborator))}
        </div>
      </Panel>

    )
  }

  const collaborators = props.model.networkData[artist.artist_id]["nodes"].filter((n) => n.id != artist.artist_id).sort((a, b) => -(a.num_collaborations - b.num_collaborations))


    return (
      <div className='grid grid-cols-9'>
        <div className='flex flex-col col-span-6' style={{gap: '1rem', padding: '1rem'}}>
          <br/>
          <div className="flex flex-row" style={{overflowX: 'scroll', gap: '0.75rem', padding: "0.25rem 0"}}>
            { getArtistHistoryCards() }
          </div>
          <NetworkChart model={props.model} artist={artist} clickedNode={clickedNode}></NetworkChart>
        </div>

        <div className='flex flex-col col-span-3' style={{gap: '1rem',padding: '1rem'}}>
          <br/>
          <Dropdown value={null}  onChange={setNewArtist} options={allArtists.filter((art) => art.artist_id !== artist.artist_id)} optionLabel="name" placeholder="Select an Artist" filter virtualScrollerOptions={{ itemSize: 38 }}/>
          <h1>{artist.name}</h1>
          <DataScroller value={collaborators} itemTemplate={artistItemTemplate} rows={5} lazy={true} inline scrollHeight="500px" header="Collaborators" />
        </div>
      </div>
    );

    function getArtistHistoryCards() {
        console.log([...history, selectedArtistId])

        return [...history, selectedArtistId]
          .map(id  => props.model.getArtist(id))
          .map((artistInfo, idx)=> {
              const artistImageLink = artistInfo.image_url || "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg";

              const style = {
                  width: "1.65rem",
                  maxWidth: '1.65rem',
                  minWidth: '1.65rem',
                  height: '1rem',
                  marginRight: '0rem',
                  marginLeft: '0.75rem'
              }

              const content = (
                <>
                    <span data-id={idx} style={{cursor: "pointer", display: "flex", alignItems: "center"}} onClick={(e    ) => backTrackToIdx(Number(e.currentTarget.dataset.id))}>
                        <span style={{height: "2.5rem", width: "2.5rem"}}>
                          <img style={{height: "100%", width: "100%", objectFit: "cover"}} src={artistImageLink}  alt={'Asd'}/>
                        </span>
                        <span className="whitespace-nowrap font-medium">{artistInfo.name}</span>
                    </span>
                    <Button className="rounded-lg" style={style} onClick={() => navigate('/artist?id=' + artistInfo.artist_id)} outlined icon="pi pi-user" tooltipOptions={{position: "bottom"}} tooltip="View Artist"/>
                </>
              );

              const chipStyle = {
                  borderRadius: "22px",
                  border: idx === history.length ? "2px solid rgb(196, 149, 27)" : "2px solid #111827"
              }

              console.log(idx === history.length)

              return <Chip style={chipStyle} template={content} />
          }).reduce(((previousValue, currentValue) =>  {
              return (
                <>
                    {previousValue}
                    <span className="flex items-center"> <i className="pi pi-arrow-right"></i></span>
                    {currentValue}
                </>
              )
          }));
    }

    function setNewArtist(e: DropdownChangeEvent) {
        if (e.value.artist_id == searchParams.get("id")) return;

        setSearchParams(prev => {
            prev.delete("history");
            prev.set("id", e.value.artist_id);
            return prev;
        });
        setArtist(props.model.getArtist(e.value.artist_id));
    }

    function clickedNode(node: ComputedNode<NetworkNode>) {
        if (node.id == searchParams.get("id")) return;
        const newHistory = [...history, searchParams.get("id")]
        setSearchParams(prev => {
            if (newHistory.length > 0)
                prev.set("history", [...history, searchParams.get("id")].splice(-5).join(","));
            else prev.delete("history");
            prev.set("id", node.id);
            return prev;
        });
        setArtist(props.model.getArtist(node.id));
    }

    function backTrackToIdx(idx: number) {
        //? selected current artist
        if (idx === history.length) return;
        setSearchParams(prev => {
            if (idx === 0) prev.delete("history");
            else prev.set("history", history.slice(0, idx).join(","));

            prev.set("id", history[idx]);
            return prev;
        });
        setArtist(props.model.getArtist(history[idx]));
    }

    function trackDisplay(track: Track, artist: Artist) {
        const contributions = artist.contributions.filter((cont) => cont.song_id.toString() === track.track_id);

        const primaryArtists = track.credits
            .filter(c => c.contribution_type === "primary")
            .map(c => {
                return <>
                    <a className="artist-name-link" onClick={() => navigate('/artist?id=' + c.artist_id)}> {props.model.getArtist(String(c.artist_id)).name}</a>
                </>
            })
            .reduce((acc, i) => {
                return <>
                    {acc}
                    {" & "}
                    {i}
                </>
            })

        return (
            <div key={track.track_id} className='flex items-center flex-row' style={{ gap: '1rem' }}>
                <div style={{ height: "4.5rem", width: "4.5rem" }}>
                    <img src={track.image_url} style={{ height: "100%", width: "100%", objectFit: "cover", borderRadius: "5%" }}></img>
                </div>
                <div className="flex flex-col" style={{ gap: '0.25rem' }}>
                    <span style={{ color: getColorPalette().amber, fontWeight: 800 }}>{track.name}</span>
                    <span style={{ fontSize: "80%" }}>{primaryArtists}</span>
                    <span className='flex' style={{ gap: "0.375rem" }}>
                        {contributions.map((cont) => {
                            return (
                                <span style={{ backgroundColor: "#424b57", borderRadius: "20px", padding: "0.25rem 0.5rem", fontSize: "80%" }}>{cont.type}</span>
                            )
                        })}
                    </span>
                </div>
            </div>
        )
    }
}


export default Network