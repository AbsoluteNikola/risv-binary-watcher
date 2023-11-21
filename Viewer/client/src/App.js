import {initialNodes, initialEdges} from './elements.js';
import ELK from 'elkjs';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    Panel,
    useNodesState,
    useEdgesState,
    useReactFlow,
    MarkerType,
    getOutgoers,
    getIncomers,
    isEdge,
    isNode
} from 'reactflow';
import './App.css';
import 'reactflow/dist/style.css';

const elk = new ELK();


const elkOptions = {
    'elk.algorithm': 'force',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '100',
    'org.eclipse.elk.force.model': 'EADES',
    'org.eclipse.elk.topdown.nodeType': 'PARALLEL_NODE',
    'org.eclipse.elk.aspectRatio': '1.7',
    'org.eclipse.elk.force.repulsion': '2.0'
};

const getLayoutedElements = (nodes, edges, options = {}) => {
    const isHorizontal = options?.['elk.direction'] === 'RIGHT';
    const graph = {
        id: 'root',
        layoutOptions: options,
        children: nodes.map((node) => ({
            ...node,
            // Adjust the target and source handle positions based on the layout
            // direction.
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',

            // Hardcode a width and height for elk to use when layouting.
            width: 150,
            height: 50,
        })),
        edges: edges,
    };

    return elk
        .layout(graph)
        .then((layoutedGraph) => ({
            nodes: layoutedGraph.children.map((node) => ({
                ...node,
                // React Flow expects a position property on the node instead of `x`
                // and `y` fields.
                position: {x: node.x, y: node.y},
            })),

            edges: layoutedGraph.edges,
        }))
        .catch(console.error);
};

function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const {fitView} = useReactFlow();

    const [selectedNode, setSelectedNode] = useState(null);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
    const onLayout = useCallback(
        ({direction, useInitialNodes = false}) => {
            const opts = {'elk.direction': direction, ...elkOptions};
            const ns = useInitialNodes ? initialNodes : nodes;
            const es = useInitialNodes ? initialEdges : edges;

            getLayoutedElements(ns, es, opts).then(({nodes: layoutedNodes, edges: layoutedEdges}) => {
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);

                window.requestAnimationFrame(() => fitView());
            });
        },
        [nodes, edges]
    );

    // Calculate the initial layout on mount.
    useLayoutEffect(() => {
        onLayout({direction: 'DOWN', useInitialNodes: true});
    }, []);

    // const [state, setState] = useState(null);

    // const callBackendAPI = async () => {
    //     const response = await fetch('/');
    //     const body = await response.json();
    //
    //     if (response.status !== 200) {
    //         throw Error(body.message)
    //     }
    //     return body;
    // };
    //
    // useEffect(() => {
    //     callBackendAPI()
    //         .then(res => setState(res.express))
    //         .catch(err => console.log(err));
    // }, [])


    // const onConnect = useCallback(
    //     (params) => setEdges((eds) => addEdge(params, eds)),
    //     [setEdges],
    // );
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const def_position = {x: 0, y: 0};

    function myFunction(raw_node) {
        setNodes((nds) => nds.concat({
            id: raw_node.Id.toString(),
            position: def_position,
            data: {label: raw_node.Name + '\nversion ' + raw_node.Version},
            size: parseInt(raw_node.Size)
        }));
        raw_node.Requirements.forEach((e) =>
            setEdges((edgs) => edgs.concat({
                id: 'e' + raw_node.Id.toString() + e.toString(),
                source: raw_node.Id.toString(),
                target: e.toString(),
                type: 'smoothstep',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#000000',
                }
            })))
    }

    const onChangeFile = async (e) => {
        const files = (e.target).files;

        if (files != null) {
            let file = files[0];
            if (file == null) return;
            console.log(file.text());
            let jsonData = JSON.parse(await file.text())
            setEdges([]);
            setNodes([]);

            jsonData.forEach(myFunction)
            // setNodes((nds) => nds.concat({id: '3333', position: {x: 0, y: 0}, data: {label: '1000'}}));
            const forceLayout = document.getElementById("testLayoutClick");
            await sleep(10);
            forceLayout.click()
        }
    };

    const getAllIncomers = (node, nodes, edges, prevIncomers = []) => {
        const incomers = getIncomers(node, nodes, edges);
        const result = incomers.reduce(
            (memo, incomer) => {
                memo.push(incomer);

                if ((prevIncomers.findIndex(n => n.id === incomer.id) === -1)) {
                    prevIncomers.push(incomer);

                    getAllIncomers(incomer, nodes, edges, prevIncomers).forEach((foundNode) => {
                        memo.push(foundNode);

                        if ((prevIncomers.findIndex(n => n.id === foundNode.id) === -1)) {
                            prevIncomers.push(incomer);

                        }
                    });
                }
                return memo;
            },
            []
        );
        return result;
    }

    const getAllOutgoers = (node, nodes, edges, prevOutgoers = []) => {
        const outgoers = getOutgoers(node, nodes, edges);
        return outgoers.reduce(
            (memo, outgoer) => {
                memo.push(outgoer);

                if ((prevOutgoers.findIndex(n => n.id === outgoer.id) === -1)) {
                    prevOutgoers.push(outgoer);

                    getAllOutgoers(outgoer, nodes, edges, prevOutgoers).forEach((foundNode) => {
                        memo.push(foundNode);

                        if ((prevOutgoers.findIndex(n => n.id === foundNode.id) === -1)) {
                            prevOutgoers.push(foundNode);
                        }
                    });
                }
                return memo;
            },
            []
        )
    }

    // const getIncomers = (node, nodes, edges) => {
    //     if (!isNode(node)) {
    //         return [];
    //     }
    //
    //     const incomersIds = edges
    //         .filter((e) => e.target === node.id)
    //         .map((e) => e.source);
    //
    //     return nodes.filter((e) => incomersIds.map((id) => {
    //         const matches = /([\w-^]+)__([\w-]+)/.exec(id);
    //         if (matches === null) {
    //             return id;
    //         }
    //         return matches[1];
    //     }).includes(e.id));
    // };
    //
    // const getOutgoers = (node, nodes, edges) => {
    //     if (!isNode(node)) {
    //         return [];
    //     }
    //
    //     const outgoerIds = edges
    //         .filter((e) => e.source === node.id)
    //         .map((e) => e.target);
    //
    //     return nodes.filter((n) => outgoerIds.map((id) => {
    //         const matches = /([\w-^]+)__([\w-]+)/.exec(id);
    //         if (matches === null) {
    //             return id;
    //         }
    //         return matches[1];
    //     }).includes(n.id));
    // };

    function setElements(node, nodes, edges, selection) {
        if (node && [...nodes, ...edges]) {
            const allIncomers = getIncomers(node, nodes, edges);
            const allOutgoers = getOutgoers(node, nodes, edges);

            setNodes((prevElements) => {
                return prevElements?.map((elem) => {
                    const incomerIds = allIncomers.map((i) => i.id)
                    const outgoerIds = allOutgoers.map((o) => o.id)

                    if (allOutgoers.length > 0 || allIncomers.length > 0) {
                        const highlight = elem.id === node.id || incomerIds.includes(elem.id) || outgoerIds.includes(elem.id)

                        elem.style = {
                            ...elem.style,
                            opacity: highlight ? 1 : 0.25,
                        }
                    }
                    return elem
                })
            });

            setEdges((prevElements) => {
                return prevElements?.map((elem) => {
                    const incomerIds = allIncomers.map((i) => i.id)
                    const outgoerIds = allOutgoers.map((o) => o.id)
                    if (selection) {
                        const animated_output =
                            outgoerIds.includes(elem.target) && node.id === elem.source
                        const animated_inp =
                            incomerIds.includes(elem.source) && node.id === elem.target

                        const animated = animated_inp || animated_output
                        elem.animated = animated
                        let color = '#FF0000'
                        if (animated_inp) color = '#008000'
                        elem.style = {
                            ...elem.style,
                            stroke: animated ? color : '#b1b1b7',
                            strokeWidth: animated ? 2 : 1,
                            opacity: animated ? 1 : 0.25,
                        }
                    } else {
                        elem.animated = false
                        elem.style = {
                            ...elem.style,
                            stroke: '#b1b1b7',
                            opacity: 1,
                            strokeWidth: 1,
                        }
                    }


                    return elem
                })
            });
        }
    }

    const highlightPath = (node, nodes, edges, selection) => {
        setElements(node, nodes, edges, selection);
    }

    const resetNodeStyles = () => {
        setNodes((prevElements) => {
            return prevElements?.map((elem) => {
                elem.style = {
                    ...elem.style,
                    opacity: 1,
                }
                return elem
            })
        });
        setEdges((prevElements) => {
            return prevElements?.map((elem) => {
                elem.animated = false
                elem.style = {
                    ...elem.style,
                    stroke: '#b1b1b7',
                    strokeWidth: 1,
                    opacity: 1,
                }
                return elem
            })
        })
    }


    return (
        <div style={{width: '100vw', height: '100vh'}}>
            <div>
                <input type="file" onChange={(e) => onChangeFile(e)}/>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                //onConnect={onConnect}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                elementsSelectable={true}
                // onNodeMouseEnter={(_event, node) => !selectedNode && highlightPath(node, [...nodes, ...edges])}
                // onNodeMouseLeave={() => !selectedNode && resetNodeStyles()}
                onSelectionChange={(selectedElements) => {
                    const node = selectedElements.nodes[0]
                    if (node == null) {
                        resetNodeStyles()
                        setSelectedNode(undefined)
                    } else {
                        setSelectedNode(node)
                        highlightPath(node, nodes, edges, true)
                    }
                }}
            >
                <Panel position="top-right">
                    <button id="testLayoutClick" onClick={() => onLayout({direction: 'DOWN'})}>vertical layout</button>

                    <button onClick={() => onLayout({direction: 'RIGHT'})}>horizontal layout</button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default () => (
    <ReactFlowProvider>
        <App/>
    </ReactFlowProvider>
);






