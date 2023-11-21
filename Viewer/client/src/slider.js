import {Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack} from "@chakra-ui/react";
import React from "react";

export function SliderMarkExample(useState) {
    const [sliderValue, setSliderValue] = useState(50)

    const labelStyles = {
        mt: '2',
        ml: '-2.5',
        fontSize: 'sm',
    }

    return (
        <Slider mt={50} aria-label='slider-ex-6' onChange={(val) => setSliderValue(val)}>
            <SliderMark value={25} {...labelStyles}>
                25%
            </SliderMark>
            <SliderMark value={50} {...labelStyles}>
                50%
            </SliderMark>
            <SliderMark value={75} {...labelStyles}>
                75%
            </SliderMark>
            <SliderMark
                value={sliderValue}
                textAlign='center'
                bg='blue.500'
                color='white'
                mt='-10'
                ml='-5'
                w='12'
            >
                {sliderValue}%
            </SliderMark>
            <SliderTrack>
                <SliderFilledTrack/>
            </SliderTrack>
            <SliderThumb/>
        </Slider>
    )
}