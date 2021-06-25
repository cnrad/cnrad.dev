import styled from 'styled-components';
import { motion } from 'framer-motion';
import PageWrapper from '../PageWrapper';

const jsonTs = () => {
    return (
        <PageWrapper>
            <Container>
                test
            </Container>
        </PageWrapper>
    );
}

const Container = styled(motion.div)`
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 75%;
    height: 100%;
    color: #fff;
    font-family: -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif;
`


export default jsonTs;
