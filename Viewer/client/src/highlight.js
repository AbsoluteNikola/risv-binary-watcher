import {getIncomers, getOutgoers} from "reactflow";

const getAllIncomers = (node, nodes, edges, prevIncomers = []) => {
    const incomers = getIncomers(node, nodes, edges);
    return incomers.reduce(
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
