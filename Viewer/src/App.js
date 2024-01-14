import {initialNodes, initialEdges} from './elements.js';
import ELK from 'elkjs';
import React, {useCallback, useLayoutEffect, useState, useEffect} from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    useReactFlow,
    MarkerType,
    useStoreApi,
    Controls,
    ControlButton
} from 'reactflow';
import {
    Button,
    Heading,
    Grid,
    GridItem,
    ChakraProvider,
    Tag
} from "@chakra-ui/react";

import {
    UnlockIcon,
    LockIcon
} from "@chakra-ui/icons";
import './App.css';
import 'reactflow/dist/style.css';
import {highlightPath, resetNodeStyles, highlightEdge} from "./highlight";
import {SliderMarkDef} from "./slider";
import useTimeout from "./useTimeout";
import CustomNode from "./CustomNode";

const elk = new ELK();

const nodeTypes = {
    selectorNode: CustomNode,
};

const elkOptions = {
    'elk.algorithm': 'force',  //sporeOverlap
    'elk.layered.spacing.nodeNodeBetweenLayers': '200',
    'elk.spacing.nodeNode': '200',
    'org.eclipse.elk.force.model': 'EADES',
    'org.eclipse.elk.topdown.nodeType': 'PARALLEL_NODE',
    'org.eclipse.elk.aspectRatio': '1.7',
    'org.eclipse.elk.force.repulsion': '2'
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
            width: 200,
            height: 70,
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
    let [maxValSize, setMaxValSize] = React.useState('1');
    let [maxValReq, setMaxValReq] = React.useState('1');
    let [maxValUse, setMaxValUse] = React.useState('1');

    let [lastSelLayout, setLastSelLayout] = React.useState('DOWN');
    let [blockSelection, setBlockSelection] = React.useState(false);
    let [blockSelectionName, setBlockSelectionName] = React.useState('Unblocked clicks');
    let [blockSelectionImage, setBlockSelectionImage] = React.useState(<UnlockIcon/>);

    let [hidePanel, setHidePanel] = React.useState(false);
    let [graphView, setGraphView] = React.useState(5);


    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);


    let [valueLeftSize, setValueLeftSize] = React.useState('0')
    let [valueRightSize, setValueRightSize] = React.useState(maxValSize)
    let [valueLeftReq, setValueLeftReq] = React.useState('0')
    let [valueRightReq, setValueRightReq] = React.useState(maxValReq)
    let [valueLeftUse, setValueLeftUse] = React.useState('0')
    let [valueRightUse, setValueRightUse] = React.useState(maxValUse)

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const {fitView} = useReactFlow();


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


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const def_position = {x: 0, y: 0};
    let _maxValSize = 1;
    let _maxValReq = 1;
    let _maxValUse = 1;
    let mapUse = new Map();

    function collectUsageData(raw_node) {
        const setReq = new Set(raw_node.Requirements);
        setReq.forEach((e) => {
            if (mapUse.has(e.toString())) {
                mapUse.set(e.toString(), mapUse.get(e.toString()) + 1);
            } else {
                mapUse.set(e.toString(), 1);
            }
        })
    }

    function newGraphFromJSNodes(raw_node) {
        const reqSize = (new Set(raw_node.Requirements)).size;
        let usage = 0;
        if (mapUse.has(raw_node.Id.toString())) {
            usage = mapUse.get(raw_node.Id.toString());
        }
        let _size = Math.ceil(parseInt(raw_node.Size) / 1024);
        setNodes((nds) => nds.concat({
            id: raw_node.Id.toString(),
            position: def_position,
            type: 'selectorNode',
            data: {usage: usage,
                   name: raw_node.Name,
                   version: raw_node.Version,
                   requirments: reqSize,
                   size: _size,
                   install_date: raw_node.InstallDate},
            size: _size,
            reqs: reqSize,
            usage: usage
        }));
    }

    function newGraphFromJSEdges(raw_node) {
        const setReq = new Set(raw_node.Requirements);

        const intSize = Math.ceil(parseInt(raw_node.Size) / 1024 );
        const reqSize = setReq.size;
        if (intSize > _maxValSize) {
            _maxValSize = intSize;
        }
        if (reqSize > _maxValReq) {
            _maxValReq = reqSize;
        }
        setReq.forEach((e) => {
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
            }))
        })
    }

    const onChangeFile = async (e) => {
        const files = (e.target).files;
        _maxValReq = 1;
        _maxValSize = 1;
        mapUse = new Map();

        if (files != null) {
            let file = files[0];
            if (file == null) return;
            setFileSel(file.name);
            let jsonData = JSON.parse(await file.text())
            setEdges([]);
            setNodes([]);

            jsonData.forEach(collectUsageData)
            jsonData.forEach(newGraphFromJSNodes)
            await sleep(20);
            jsonData.forEach(newGraphFromJSEdges)

            _maxValUse = Math.max(...mapUse.values());
            console.log(_maxValUse);
            setMaxValUse(_maxValUse);
            setMaxValReq(_maxValReq);
            setMaxValSize(_maxValSize);
            setValueRightUse(_maxValUse);
            setValueRightReq(_maxValReq);
            setValueRightSize(_maxValSize);

            const forceLayout = document.getElementById(lastSelLayout);
            await sleep(15);
            forceLayout.click();
            await sleep(20);
            setTimeout(fitView, 50);
        }
    };

    const store = useStoreApi();

    const clearSelectedNode = () => store.getState().unselectNodesAndEdges();

    const locker = () => {
        if (blockSelection) {
            setBlockSelectionName('Unblocked clicks');
            setBlockSelectionImage(<UnlockIcon/>);
            clearSelectedNode();
        } else {
            setBlockSelectionName('Blocked clicks');
            setBlockSelectionImage(<LockIcon/>);
        }
        setBlockSelection(!blockSelection);
    }

    const hide_panel = () => {
        setHidePanel(true);
        setGraphView(6);
        setTimeout(fitView, 15);
    };

    const show_panel = () => {
        setHidePanel(false);
        setGraphView(5);
        setTimeout(fitView, 15);
    };


    const [filterTask] = useTimeout(() => {
        const hiddenIds = [];
        setNodes((aNodes) => {
                return aNodes?.map((elem) => {
                    elem.hidden = elem.size < valueLeftSize || elem.size > valueRightSize || elem.reqs < valueLeftReq
                        || elem.reqs > valueRightReq || elem.usage < valueLeftUse || elem.usage > valueRightUse;
                    if (elem.hidden === true) {
                        hiddenIds.push(elem.id);
                    }
                    return elem
                })
            }
        )
        setEdges((aEdges) => {
                return aEdges?.map((elem) => {
                    elem.hidden = hiddenIds.includes(elem.target) || hiddenIds.includes(elem.source);
                    return elem
                })
            }
        )
    }, 1500);


    return (
        <Grid w="100vw" h="100vh" templateColumns="repeat(6, 1fr)" gap={0}>
            <GridItem borderRight="1px solid" borderColor="gray.200" hidden={hidePanel}>
                <Grid templateRaws="repeat(4, 1fr)" gap={0}>
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
                                        mt={4} mb={2}>Horizontal</Button>
                            </GridItem>
                        </Grid>
                    </GridItem>
                    <GridItem p={4} borderTop="1px solid" borderBottom="1px solid" borderColor="gray.200">
                        <Heading as='h4' size='md' mt={2}>Filters:</Heading>
                        <Heading as='h5' size='sm' mt={4}>Size (Mb):</Heading>
                        {SliderMarkDef(maxValSize, valueLeftSize, setValueLeftSize, valueRightSize, setValueRightSize, filterTask)}
                        <Heading as='h5' size='sm' mt={6}>Depends on:</Heading>
                        {SliderMarkDef(maxValReq, valueLeftReq, setValueLeftReq, valueRightReq, setValueRightReq, filterTask)}
                        <Heading as='h5' size='sm' mt={6}>Used by:</Heading>
                        {SliderMarkDef(maxValUse, valueLeftUse, setValueLeftUse, valueRightUse, setValueRightUse, filterTask)}
                        <Button id="apply" w='100%' mt={4} mb={2} onClick={() => {
                            setValueLeftReq('0');
                            setValueLeftSize('0');
                            setValueRightReq(maxValReq);
                            setValueRightSize(maxValSize);
                            setValueRightUse(maxValUse);
                            filterTask();
                        }}>Reset filters</Button>

                    </GridItem>
                    <GridItem p={4} borderBottom="1px solid" borderColor="gray.200">
                        <Button id='locker' mt={2} isActive={blockSelection} variant='solid' width='100%'
                                onClick={locker} rightIcon={blockSelectionImage}>{blockSelectionName}</Button>
                        <Button id='fitview_button' mt={4} mb={2} variant='solid' width='100%' onClick={fitView}>Reset
                            view</Button>
                    </GridItem>

                    <GridItem p={4} alignSelf="end">
                        <Button id='hide_panel' mt={2}
                                variant='solid' width='100%'
                                onClick={hide_panel}>Hide panel</Button>
                    </GridItem>
                </Grid>
            </GridItem>

            <GridItem colSpan={graphView}>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    //onConnect={onConnect}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    elementsSelectable={true}
                    onSelectionChange={(selectedElements) => {
                        if (!blockSelection) {
                            const node = selectedElements.nodes[0]
                            if (node == null) {
                                resetNodeStyles(setNodes, setEdges)
                            } else {
                                highlightPath(node, nodes, edges, true, setNodes, setEdges)
                            }
                            const edge = selectedElements.edges[0]
                            if (edge == null && node == null) {
                                resetNodeStyles(setNodes, setEdges)
                            } else if (edge != null) {
                                highlightEdge(edge, setNodes, setEdges)
                            }
                        }
                    }}
                >
                    <Controls>
                        <ControlButton id='show_panel' onClick={show_panel} hidden={!hidePanel}
                                       style={{'font-weight': "bold"}}>P
                        </ControlButton>
                    </Controls>
                </ReactFlow>

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






