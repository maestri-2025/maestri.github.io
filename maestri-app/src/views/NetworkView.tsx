import { ComputedNode } from '@nivo/network'
import { useState } from "react";
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
                        <img style={{
                    <div className="flex flex-row" style={{ fontSize: "150%", marginBottom: 2 }}>{collaborator.name}</div>
                    <div className="flex flex-row">
                            width: 75,
                            height: 75,

                        }} src={collaboratorImageLink} alt={collaborator.name} />
                        <div>
                            {
                                    return <Chip className={`chip-${type}-${collaborator.artist_id}`} style={{ fontSize: "70%", margin: 1 }} label={`${type}: ${count}`} />
                                contributionTypesCounts.map(([type, count]: [string, number]) => {
                            }
                                })
                            {
                                    return <Tooltip target={`.chip-${type}-${collaborator.artist_id}`} content={`How many ${type} credits ${collaborator.name} has on songs that ${artist.name} has contributed to`} />
                                contributionTypesCounts.map(([type, _]: [string, number]) => {
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

    const history = searchParams.get("history")?.split(",") || [];
    return (
        <div className='flex'>
            <div>
                <br />
                <Dropdown value={null} onChange={setNewArtist} options={allArtists.filter((art) => art.artist_id !== artist.artist_id)} optionLabel="name" placeholder="Select an Artist" filter virtualScrollerOptions={{ itemSize: 38 }} />
                <h1>{artist.name}</h1>
                    <DataScroller value={collaborators} itemTemplate={artistItemTemplate} rows={5} lazy={true} inline scrollHeight="500px" header="Collaborators" />
            </div>
            <NetworkChart model={props.model} artist={artist} clickedNode={clickedNode}></NetworkChart>

        </div>
    );

    function setNewArtist(e: DropdownChangeEvent) {
        setSearchParams(prev => {
            prev.set("history", [...history, searchParams.get("id")].splice(-5).join(","));
            prev.set("id", e.value.artist_id);
            return prev;
        });
        setArtist(props.model.getArtist(e.value.artist_id));
    }

    function clickedNode(node: ComputedNode<NetworkNode>) {
        setSearchParams(prev => {
            prev.set("history", [...history, searchParams.get("id")].splice(-5).join(","));
            prev.set("id", node.id);
            return prev;
        });
        setArtist(props.model.getArtist(node.id));
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