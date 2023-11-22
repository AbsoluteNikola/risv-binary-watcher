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
import {
    Button,
    Heading,
    Grid,
    GridItem,
    ChakraProvider,
    Tag,
} from "@chakra-ui/react";

import {
    UnlockIcon,
    LockIcon
} from "@chakra-ui/icons";
import './App.css';
import 'reactflow/dist/style.css';
import {highlightPath, resetNodeStyles} from "./highlight";
import {SliderMarkExample} from "./slider";

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
                position: {x: node.x, y: node.y},
            })),

            edges: layoutedGraph.edges,
        }))
        .catch(console.error);
};

function App() {
    let [file_sel, setFileSel] = React.useState('No file selected');
    let [maxValSize, setMaxValSize] = React.useState('100');
    let [maxValReq, setMaxValReq] = React.useState('100');

    let [lastSelLayout, setLastSelLayout] = React.useState('DOWN');
    let [blockSelection, setBlockSelection] = React.useState(false);
    let [blockSelectionName, setBlockSelectionName] = React.useState('Unblocked clicks');
    let [blockSelectionImage, setBlockSelectionImage] = React.useState(<UnlockIcon/>);

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);


    let [valueLeftSize, setValueLeftSize] = React.useState('0')
    let [valueRightSize, setValueRightSize] = React.useState(maxValSize)
    let [valueLeftReq, setValueLeftReq] = React.useState('0')
    let [valueRightReq, setValueRightReq] = React.useState(maxValReq)


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
            setLastSelLayout(direction);
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

    function newGraphFromJS(raw_node) {
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
            setFileSel(file.name);
            let jsonData = JSON.parse(await file.text())
            setEdges([]);
            setNodes([]);

            jsonData.forEach(newGraphFromJS)
            const forceLayout = document.getElementById(lastSelLayout);
            await sleep(15);
            forceLayout.click();
            await sleep(15);
            setTimeout(fitView, 15);
        }
    };

    const locker = () => {
        if (blockSelection) {
            setSelectedNode(undefined);
            setBlockSelectionName('Unblocked clicks');
            setBlockSelectionImage(<UnlockIcon/>);
        } else {
            setBlockSelectionName('Blocked clicks');
            setBlockSelectionImage(<LockIcon/>);
        }
        setBlockSelection(!blockSelection);
    }


    return (
        <Grid w="100vw" h="100vh" templateColumns="repeat(6, 1fr)" gap={0}>
            <GridItem borderRight="1px solid" borderColor="gray.200">
                <Grid templateRaws="repeat(3, 1fr)" gap={0}>
                    {/*<div style={{width: '100vw', height: '100vh'}}>*/}
                    <GridItem p={4}>
                        <label>
                            <input type="file" style={{display: 'none'}} onChange={(e) => onChangeFile(e)}/>
                            <Button as="span" variant='solid' width='100%'>Upload File</Button>
                        </label>
                        <Tag variant='ghost' mt={2} w='100%'>{file_sel}</Tag>
                        <Heading as='h4' size='md' mt={4}>Layout style:</Heading>
                        <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                            <GridItem w='100%'>
                                <Button id="DOWN" w='100%' onClick={() => onLayout({direction: 'DOWN'})}
                                        mt={4}>Vertical</Button>
                            </GridItem>
                            <GridItem w='100%'>
                                <Button id="RIGHT" w='100%' style={{float: 'right'}}
                                        onClick={() => onLayout({direction: 'RIGHT'})}
                                        mt={4} mb={4}>Horizontal</Button>
                            </GridItem>
                        </Grid>
                    </GridItem>
                    <GridItem p={4} borderTop="1px solid" borderBottom="1px solid" borderColor="gray.200">
                        <Heading as='h4' size='md' mt={4}>Filters:</Heading>
                        <Heading as='h5' size='sm' mt={4}>by size:</Heading>
                        {SliderMarkExample(maxValSize, valueLeftSize, setValueLeftSize, valueRightSize, setValueRightSize)}
                        <Heading as='h5' size='sm' mt={6}>by requirements count:</Heading>
                        {SliderMarkExample(maxValReq, valueLeftReq, setValueLeftReq, valueRightReq, setValueRightReq)}

                        <Button id="apply" w='100%' mt={4} onClick={() => {
                            setValueLeftReq('0');
                            setValueLeftSize('0');
                            setValueRightReq(maxValReq);
                            setValueRightSize(maxValSize);
                        }}>Reset filters</Button>

                    </GridItem>
                    <GridItem p={4}>
                        <Button id='locker' mt={4} isActive={blockSelection} variant='solid' width='100%'
                                onClick={locker} rightIcon={blockSelectionImage}>{blockSelectionName}</Button>
                        <Button id='fitview_button' mt={4} variant='solid' width='100%' onClick={fitView}>Reset
                            view</Button>
                    </GridItem>
                </Grid>
            </GridItem>

            <GridItem colSpan={5}>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    //onConnect={onConnect}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    elementsSelectable={true}
                    onSelectionChange={(selectedElements) => {
                        if (!blockSelection) {
                            const node = selectedElements.nodes[0]
                            if (node == null) {
                                resetNodeStyles(setNodes, setEdges)
                                setSelectedNode(undefined)
                            } else {
                                setSelectedNode(node)
                                highlightPath(node, nodes, edges, true, setNodes, setEdges)
                            }
                        }
                    }}
                >
                </ReactFlow>
                {/*</div>*/}
            </GridItem>
        </Grid>
    )
        ;
}

export default () => (
    <ChakraProvider>
        <ReactFlowProvider>
            <App/>
        </ReactFlowProvider>
    </ChakraProvider>
);






