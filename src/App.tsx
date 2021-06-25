import {
    Switch,
    Route,
    useLocation
} from "react-router-dom";
import Main from "./Main"
import Tools from "./Tools"
import { AnimatePresence } from "framer-motion";
import styled from 'styled-components';

import jsonTs from './tools/jsonTs';


const App = () => {

    const location = useLocation();

    return (
        <Entire>
            <AnimatePresence exitBeforeEnter>
                <Switch location={location} key={location.pathname}>
                    <Route exact path="/" component={Main} />
                    <Route exact path="/tools" component={Tools} />
                    <Route exact path="/tools/json-ts" component={jsonTs} />
                </Switch>
            </AnimatePresence>
        </Entire>
    );
}

const Entire = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    inset: 0;
    background: #18181b;
`

export default App;