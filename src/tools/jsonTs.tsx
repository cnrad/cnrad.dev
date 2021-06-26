import styled from 'styled-components';
import PageWrapper from '../PageWrapper';
import { Link } from "react-router-dom";

const jsonTs = () => {
    return (
        <PageWrapper>
            <To to="/tools">back</To>
        </PageWrapper>
    );
}

const To = styled(Link)`
    font-size: 2rem;
`


export default jsonTs;
