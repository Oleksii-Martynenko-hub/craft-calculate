import React from 'react';
import {
    Slide,
    useScrollTrigger
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

interface Props {
    children: React.ReactElement;
}

export default function HideOnScroll({ children }: Props) {
    const trigger = useScrollTrigger();
    const matches = useMediaQuery('(max-width:899px)');
    return (
        <Slide appear={false} direction="down" in={!trigger || matches}>
            {children}
        </Slide>
    );
}
