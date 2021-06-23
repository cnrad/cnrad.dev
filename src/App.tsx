import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import * as Icons from './components/Icons'


//framer motion stagger children


const App = () => {

    const containerAnim = {
        init: {
            opacity: 1
        },
        load: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const childAnim = {
        init: {
            opacity: 0,
            x: 25
        },
        load: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        }
    }

    let [time, setTime] = useState("00:00:00 p.m.");

    useEffect(() => {
        updateTime();
    })

    function updateTime(){
        let current = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
        setTime(current.toLowerCase().slice(-11, -1) + ".m.");
        setTimeout(updateTime, 1000);
    }

    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet" /> 
            <Wrapper>
                <Container initial="init" animate="load" variants={containerAnim}>
                    <Header variants={childAnim}>Conrad Crawford</Header>
                    <Bio variants={childAnim}>16 year old web <Link color="#949eb3" href="https://github.com/cnrad">developer</Link>.</Bio>
                    <Time variants={childAnim}>
                        <Icons.ClockIcon />
                        {time}
                    </Time>
                    <Contact variants={childAnim}>
                        <Link color="#ccc" target="_blank" href="mailto:hello@cnrad.dev">
                            <Icons.MailIcon />
                        </Link>
                        <Link color="#ccc" target="_blank" href="https://twitter.com/cnraddd">
                            <Icons.TwitterIcon />
                        </Link>
                        <Link color="#ccc" target="_blank" href="https://github.com/cnrad">
                            <Icons.GitHubIcon />
                        </Link>
                    </Contact>
                </Container>
                <Background src="https://wallpaperaccess.com/full/1638152.jpg" />
            </Wrapper>
        </>
    );
}

const Wrapper = styled.div`
    position: fixed;
    inset: 0;
    margin: 0;

    font-size: 16px;
    font-family: 'Inter', sans-serif;
    color: #fff;
`

const Background = styled.img`
    z-index: 0;
    position: fixed;
    top: -5rem;
    right: 0;
    
    width: auto;
    height: 100%;
    min-height: 70rem;
    filter: grayscale(50%);
    pointer-events: none;
`

const Container = styled(motion.div)`
    z-index: 1;
    position: fixed;
    top: 50%;
    left: 0;
    transform: translate(0, -50%);
    width: 20%;
    min-width: 25rem;
    height: 125%;
    background: rgba(0, 0, 0, 0.9);
    overflow: hidden;
    box-shadow: 150px 0px 100px rgba(0, 0, 0, 0.9);

    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: left;
    justify-content: center;
    padding-left: 4rem;
`

const Header = styled(motion.div)`
    font-size: 2rem;
    font-weight: 600;
`

const Bio = styled(motion.div)`
    font-size: 1.4rem;
    font-weight: 400;
    margin-top: -5px;
    color: #7b8290;
`

const Link = styled.a<{color: string}>`
    color: ${({color}) => color};
    text-decoration: none;
    transition: color 0.15s ease-in-out;

    &:hover {
        text-decoration: underline;
        color: #fff;
    }
`

const Time = styled(motion.div)`
    font-size: 1.25rem;
    font-weight: 300;
    margin-bottom: 25px;
`

const Contact = styled(motion.div)`
    display: flex;
    flex-direction: row;
    gap: 15px;

    height: auto;
    width: 100%;
    color: #ddd;
`

export default App;
