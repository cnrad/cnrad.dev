import styled from 'styled-components';
import { motion } from 'framer-motion';
import PageWrapper from '../PageWrapper';
import { Link } from "react-router-dom";

const jsonTs = () => {
    return (
        <PageWrapper>
            <Link to="/tools">back</Link>
        </PageWrapper>
    );
}

const To = styled(motion.a)`
    font-size: 2rem;
`


export default jsonTs;
