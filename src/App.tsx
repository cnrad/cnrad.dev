import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Main from "./Main"
import Tools from "./Tools"
import { AnimatePresence } from "framer-motion";

import jsonTs from './tools/jsonTs';


const App = () => {

    return (
        <Router>
            <AnimatePresence exitBeforeEnter>
                <Switch>
                    <Route exact path="/" component={Main} />
                    <Route exact path="/tools" component={Tools} />
                    <Route exact path="/tools/json-ts" component={jsonTs} />
                </Switch>
            </AnimatePresence>
        </Router>
    );
}

export default App;