import { motion } from "framer-motion";
import styled from 'styled-components';

const PageWrapper = (props: any) => {

    const pageVariants = {
        initial: {
          opacity: 0,
        },
        in: {
          opacity: 1,
        },
        out: {
          opacity: 0,
        },
    }

    return (
        <Wrapper
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
        >
            {props.children}
        </Wrapper>
    );
}

const Wrapper = styled(motion.div)`
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #18181b;
`

export default PageWrapper;