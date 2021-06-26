import styled from 'styled-components';
import { motion } from 'framer-motion';
import PageWrapper from './PageWrapper';
import { Link } from "react-router-dom";

const Tools = () => {

    const hoverItem = {
        color: "#fff",
        scale: 0.9,
        transition: {
            duration: 0.15,
            ease: "easeInOut"
        }
    }

    return (
        <PageWrapper>
            <Container>
                <Header>
                    <Cnrad>cnrad</Cnrad> toolkit
                </Header>
                <ToolItems>

                    <To to="/tools/json-ts">
                        <Item whileHover={hoverItem}>
                            Json to TypeScript
                        </Item>
                    </To>

                </ToolItems>
            </Container>
        </PageWrapper>
    );
}

const Container = styled(motion.div)`
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 65%;
    height: 100%;
    color: #fff;
    font-family: -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif;
`

const Header = styled(motion.div)`
    font-size: 3rem;
    font-weight: 400;
    margin: 2rem 0;
`

const Cnrad = styled(motion.span)`
    background: linear-gradient(270deg, #c700ff, #46a0ff);
    background-clip: text;
    -webkit-background-clip: text;
    color: rgba(0, 0, 0, 0);
    font-weight: 700;
`

const ToolItems = styled(motion.div)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`

const To = styled(Link)`
    text-decoration: none;
`

const Item = styled(motion.div)`
    width: auto;
    height: 3rem;
    background: rgba(255, 255, 255, 0.05);
    border: solid 0.5px #7b8290;
    border-radius: 10px;
    padding: 0.25rem 1.5rem;
    color: #7b8290;
    font-size: 1.25rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

export default Tools;
