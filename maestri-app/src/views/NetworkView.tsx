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
    const idParam = searchParams.get("id");

    const [artist, setArtist] = useState(idParam ? props.model.getArtist(idParam) : props.model.getArtist("1405"));
    const allArtists = props.model.getArtists();

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
        <div className='flex'>
            <div>
                <br />
                <Dropdown value={null} onChange={setNewArtist} options={allArtists.filter((art) => art.artist_id !== artist.artist_id)} optionLabel="name" placeholder="Select an Artist" filter virtualScrollerOptions={{ itemSize: 38 }} />
                <h1>{artist.name}</h1>
                <Button onClick={() => navigate('/comparison?ids=' + artist.artist_id)} label={"Compare artists"} icon="pi pi-user" rounded outlined />
                <Button onClick={() => navigate('/artist?id=' + artist.artist_id)} label={"View"} icon="pi pi-star" rounded outlined />
                <br />
                <br />
                <div className='width-100'>*Node size is determined by overall number of credits</div>
                <br />
                <br />
                <div className='width-100'>*Distance from center node and edge thickness are determined by contributions to {artist.name}</div>
                <div>
                    <DataScroller value={collaborators} itemTemplate={artistItemTemplate} rows={5} lazy={true} inline scrollHeight="500px" header="Collaborators" />
                </div>
            </div>
            <NetworkChart model={props.model} artist={artist} clickedNode={clickedNode}></NetworkChart>

        </div>
    );

    function setNewArtist(e: DropdownChangeEvent) {
        // update search params
        const newQueryParameters: URLSearchParams = new URLSearchParams();
        newQueryParameters.set("id", e.value.artist_id)
        setSearchParams(newQueryParameters);
        setArtist(props.model.getArtist(e.value.artist_id))
    }

    function clickedNode(node: ComputedNode<NetworkNode>) {
        // update search params
        const newQueryParameters: URLSearchParams = new URLSearchParams();
        newQueryParameters.set("id", node.id)
        setSearchParams(newQueryParameters);
        setArtist(props.model.getArtist(node.id))
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