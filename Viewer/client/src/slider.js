import {
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Grid,
    GridItem
} from "@chakra-ui/react";
import useTimeout from './useTimeout';
import React from "react";


export function SliderMarkDef(maxVal, valueLeft, setValueLeft, valueRight, setValueRight, filterTask) {

    const handleChangeLeft = (value) => {
        setValueLeft(value);
        filterTask();
    };
    const handleChangeRight = (value) => {
        setValueRight(value);
        filterTask();
    };
    const handleChangeBoth = (value) => {
        setValueLeft(value[0]);
        setValueRight(value[1]);
        filterTask();
    }

    return (
        <>
            <RangeSlider mt={4} aria-label={['min', 'max']} value={[valueLeft, valueRight]} min={0} max={maxVal}
                         step={1} onChange={handleChangeBoth}>
                <RangeSliderTrack>
                    <RangeSliderFilledTrack/>
                </RangeSliderTrack>
                <RangeSliderThumb index={0}/>
                <RangeSliderThumb index={1}/>
            </RangeSlider>
            <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                <GridItem w='100%'>
                    <NumberInput value={valueLeft} min={0} max={valueRight}
                                 onChange={handleChangeLeft}>
                        <NumberInputField/>
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                </GridItem>
                <GridItem w='100%'>
                    <NumberInput style={{float: 'right'}} value={valueRight}
                                 min={valueLeft} max={maxVal}
                                 onChange={handleChangeRight}>
                        <NumberInputField/>
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                </GridItem>
            </Grid>
        </>

    )
}