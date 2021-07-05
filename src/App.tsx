import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import * as Icons from './components/Icons'

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

    const linkAnimParent = {
        init: {
            opacity: 1
        },
        load: {
            opacity: 1,
            transition: {
                delayChildren: 0.5,
                staggerChildren: 0.1
            }
        }
    }

    const linkAnim = {
        init: {
            opacity: 0,
            y: 10
        },
        load: {
            opacity: 1,
            y: 0,
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
                    <Bio variants={childAnim}>16 year old web <DevLink color="#949eb3" href="https://github.com/cnrad">developer</DevLink>.</Bio>
                    <Time variants={childAnim}>
                        <Icons.ClockIcon />
                        {time}
                    </Time>
                    <Contact initial="init" animate="load"  variants={linkAnimParent}>
                        <To variants={linkAnim} color="#ccc" target="_blank" href="mailto:hello@cnrad.dev">
                            <Icons.MailIcon />
                        </To>
                        <To variants={linkAnim} color="#ccc" target="_blank" href="https://twitter.com/cnraddd">
                            <Icons.TwitterIcon />
                        </To>
                        <To variants={linkAnim} color="#ccc" target="_blank" href="https://github.com/cnrad">
                            <Icons.GitHubIcon />
                        </To>
                    </Contact>
                </Container>
                <Background src="/assets/background.jpg" />
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
    align-items: left;
    justify-content: center;
    padding-left: 4rem;

    & > * {
        margin-bottom: 25px;
    }
`

const Header = styled(motion.div)`
    font-size: 2rem;
    font-weight: 600;
`

const Bio = styled(motion.div)`
    font-size: 1.4rem;
    font-weight: 400;
    margin-top: -20px;
    color: #7b8290;
`

const DevLink = styled(motion.a)<{color: string}>`
    color: ${({color}) => color};
    text-decoration: none;
    transition: color 0.15s ease-in-out;
    position: relative;

    &:hover {
        color: #fff;
    }

    &:before {
        content: "";
        position: absolute;
        width: 0;
        height: 2px;
        bottom: -1px;
        left: 0;
        background-color: #FFF;
        visibility: hidden;
        transition: all 0.3s ease-in-out;
    }

    &:hover:before {
        visibility: visible;
        width: 100%;
    }
`

const To = styled(motion.a)<{color: string}>`
    color: ${({color}) => color};
    text-decoration: none;
    transition: color 0.15s ease-in-out;
    position: relative;

    &:hover {
        color: #fff;
    }
`

const Time = styled(motion.div)`
    font-size: 1.25rem;
    font-weight: 300;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    height: 1.25rem;
    padding: 2px 0;
    
    & > * {
        margin-right: 10px;
    }
`

const Contact = styled(motion.div)`
    display: flex;
    flex-direction: row;

    height: auto;
    width: 100%;
    color: #ddd;

    & > * {
        margin-right: 15px;
    }
`

export default App;
