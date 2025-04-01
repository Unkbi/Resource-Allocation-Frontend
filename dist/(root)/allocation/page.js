"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Allocation;
const page_module_css_1 = __importDefault(require("../../page.module.css"));
const material_1 = require("@mui/material");
const react_redux_1 = require("react-redux");
const TeamAllocation_1 = __importDefault(require("@/app/components/ResourceAllocation/component/TeamAllocation"));
const ProjectAllocation_1 = __importDefault(require("@/app/components/ResourceAllocation/component/ProjectAllocation"));
const react_1 = require("react");
const fetchResourcesAction_1 = require("@/app/redux/actions/fetchResourcesAction");
const fetchProjectsAction_1 = require("@/app/redux/actions/fetchProjectsAction");
function Allocation() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const view = (0, react_redux_1.useSelector)(state => state.allocationView.view);
    (0, react_1.useEffect)(() => {
        dispatch((0, fetchResourcesAction_1.fetchAllResources)());
        dispatch((0, fetchProjectsAction_1.fetchAllProjects)());
    }, []);
    const getContentByRole = view => {
        switch (view) {
            case 'Projects':
                return React.createElement(ProjectAllocation_1.default, null);
            // case 'Organizations':
            //   return <OrganizationAllocation />;
            case 'Teams':
                return React.createElement(TeamAllocation_1.default, null);
            default:
                return null;
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(material_1.Box, { className: page_module_css_1.default.page },
            React.createElement("main", { className: page_module_css_1.default.wrapperBox }, getContentByRole(view)))));
}
