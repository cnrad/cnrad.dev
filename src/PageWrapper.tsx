import { motion } from "framer-motion";
import styled from 'styled-components';

const PageWrapper = (props: any) => {

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.25,
      };

    return (
        <Wrapper
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={pageTransition}
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