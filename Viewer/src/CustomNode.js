import React, {memo} from 'react';
import { Handle, Position} from 'reactflow'
export default memo(({data, isConnectable}) => {
    return (
        <>
            <Handle
            type="target"
            position={Position.Top}
            style={{background: '#000000', height: '10px', 'border-radius': '4px',  width: '10px', content: 'aaa'}}
            isConnectable={isConnectable}
            />
            <div style={{border: '1px solid #777', 'border-radius': '10px', padding: 10}}>
                <span style={{color: '#008000'}}>In use: {data.usage}</span> <br/>
                Name: {data.name} <br/>
                Version: {data.version} <br/>
                <span style={{color: '#FF0000'}}>Requirements: {data.requirments}</span>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{background: '#000000', height: '10px', 'border-radius': '4px',  width: '10px', content: 'aaa'}}
                isConnectable={isConnectable}
            />
        </>
    );
});