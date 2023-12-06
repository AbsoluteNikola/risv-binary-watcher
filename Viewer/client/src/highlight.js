import {getIncomers, getOutgoers} from "reactflow";


function setElements(node, nodes, edges, selection, setNodes, setEdges) {
    if (node && [...nodes, ...edges]) {
        const allIncomers = getIncomers(node, nodes, edges);
        const allOutgoers = getOutgoers(node, nodes, edges);

        setNodes((prevElements) => {
            return prevElements?.map((elem) => {
                const incomerIds = allIncomers.map((i) => i.id)
                const outgoerIds = allOutgoers.map((o) => o.id)

                if (allOutgoers.length > 0 || allIncomers.length > 0) {
                    const highlight = elem.id === node.id || incomerIds.includes(elem.id) || outgoerIds.includes(elem.id)
                    const main_node = elem.id === node.id

                    elem.style = {
                        ...elem.style,
                        opacity: highlight ? 1 : 0.25,
                        background: main_node ? '#E2E8F0' : 'white',
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

export const highlightPath = (node, nodes, edges, selection, setNodes, setEdges) => {
    setElements(node, nodes, edges, selection, setNodes, setEdges);
}

export const highlightEdge = (edge, setNodes, setEdges) => {
    const targets = [edge.source, edge.target];
    setNodes((prevElements) => {
        return prevElements?.map((elem) => {

            if (targets.includes(elem.id)) {
                elem.style = {
                    ...elem.style,
                    opacity: 1,
                    background: '#E2E8F0',
                }
            }
            return elem
        })
    });
    setEdges((prevElements) => {
            return prevElements?.map((elem) => {

                if (elem.id === edge.id) {
                    elem.animated = true
                    elem.style = {
                        ...elem.style,
                        stroke: '#0000FF',
                        strokeWidth: 2,
                        opacity: 1,
                    }
                }

                return elem
            })
        }
    )
    ;
}

export const resetNodeStyles = (setNodes, setEdges) => {
    setNodes((prevElements) => {
        return prevElements?.map((elem) => {
            elem.style = {
                ...elem.style,
                opacity: 1,
                background: 'white'
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
