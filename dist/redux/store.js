"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStore = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const authReducer_1 = __importDefault(require("../redux/reducers/authReducer"));
const allocationViewReducer_1 = __importDefault(require("../redux/reducers/allocationViewReducer"));
const teamsReducer_1 = __importDefault(require("./reducers/teamsReducer"));
const projectsReducer_1 = __importDefault(require("./reducers/projectsReducer"));
const resourcesReducer_1 = __importDefault(require("./reducers/resourcesReducer"));
const resourceAllocationReducer_1 = __importDefault(require("./reducers/resourceAllocationReducer"));
const toastReducer_1 = __importDefault(require("./reducers/toastReducer"));
const dialogReducer_1 = __importDefault(require("./reducers/dialogReducer"));
const dataGridReducer_1 = __importDefault(require("./reducers/dataGridReducer"));
const makeStore = () => {
    return (0, toolkit_1.configureStore)({
        reducer: {
            user: authReducer_1.default,
            allocationView: allocationViewReducer_1.default,
            teams: teamsReducer_1.default,
            projects: projectsReducer_1.default,
            resources: resourcesReducer_1.default,
            resourceAllocations: resourceAllocationReducer_1.default,
            toast: toastReducer_1.default,
            globalDialog: dialogReducer_1.default,
            dataGrid: dataGridReducer_1.default,
        },
    });
};
exports.makeStore = makeStore;
