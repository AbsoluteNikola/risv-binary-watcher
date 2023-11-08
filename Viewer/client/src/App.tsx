import React, {useEffect, useState, useCallback, ChangeEvent} from 'react';
import logo from './logo.svg';
import './App.css';
import ReactFlow, {useNodesState, useEdgesState, addEdge, Connection, Edge, MarkerType} from 'reactflow';
import dagre from '@dagrejs/dagre';

import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

function App() {

    let initialNodes = [
        {id: '1', position: {x: 0, y: 0}, data: {label: '1'}},
        {id: '2', position: {x: 0, y: 100}, data: {label: '2'}},
    ];
    let initialEdges = [{
        id: 'e1-2', source: '1', target: '2', markerEnd: {
            type: MarkerType.ArrowClosed,
        },
    }];

    const [state, setState] = useState(null);

    const callBackendAPI = async () => {
        const response = await fetch('/');
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message)
        }
        return body;
    };

    useEffect(() => {
        callBackendAPI()
            .then(res => setState(res.express))
            .catch(err => console.log(err));
    }, [])

    let [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    let [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onChange = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const files = (e.target as HTMLInputElement).files;

        if (files != null) {
            let file = files[0];
            if (file == null) return;
            console.log(file.text());
            //let jsonData = JSON.parse(await file.text())
            setNodes((nds) => nds.concat({id: '3', position: {x: 0, y: 200}, data: {label: '1000'}}));
        }
    };

    return (
        <div style={{width: '100vw', height: '100vh'}}>
            <div>
                <input type="file" onChange={(e) => onChange(e)}/>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            />
        </div>
    );
}


export default App;






