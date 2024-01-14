import React, {memo} from 'react';
import { Handle, Position} from 'reactflow'
import {
    IconButton,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
} from '@chakra-ui/react'
import { InfoOutlineIcon } from "@chakra-ui/icons";
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
                <span style={{color: '#008000'}}>In use: {data.usage}</span>
                <Popover>
                    <PopoverTrigger>
                        <IconButton style={{float: 'right', 'margin-top': '5px'}}  isRound={true} size='s' variant='ghost' icon={<InfoOutlineIcon/>}/>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>{data.name}</PopoverHeader>
                        <PopoverBody>
                            Version: {data.version} <br/>
                            Size: {data.size} Mb <br/>
                            Install date: {data.install_date}<br/> <br/>
                            In use: <br/> {data.in_use_list} <br/> <br/>
                            Requirements: <br/> {data.req_list}
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
                 <br/>
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