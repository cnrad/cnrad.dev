import styled from 'styled-components';
import { motion } from 'framer-motion';
import PageWrapper from './PageWrapper';
import { Link } from "react-router-dom";

const Tools = () => {
    return (
        <PageWrapper>
            <Container>
                <Link to="/tools/json-ts">Json to TypeScript</Link>
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

const To = styled(Link)`
    font-size: 2rem;
`

export default Tools;
