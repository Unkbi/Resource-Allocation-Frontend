"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignAllocationValidationSchema = exports.addAllocationValidationSchema = exports.addResourceValidationSchema = exports.addProjectValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const addProjectValidationSchema = (projects = []) => {
    const projectNames = Array.isArray(projects?.result) ? projects?.result?.map((project) => project.Name?.toLowerCase().trim()) : [];
    return Yup.object({
        Name: Yup.string().max(90, 'Reached Max Characters').required('Project Name is required').test('unique-name', 'Project Name already exists. Please choose another name.', (value) => {
            if (!value)
                return true;
            return !projectNames.includes(value.toLowerCase().trim());
        }),
        Type: Yup.string().required("Project type is required"),
        AllowOvertime: Yup.boolean().required("Allow overtime selection is required"),
        StartDate: Yup.date()
            .nullable()
            .typeError('Invalid date format')
            .test('required-if-end-date', 'Start date is required if end date is provided', function (value) {
            const { EndDate } = this.parent;
            return !EndDate || value !== null;
        }),
        EndDate: Yup.date()
            .nullable()
            .typeError('Invalid date format')
            .test('required-if-start-date', 'End date is required if start date is provided', function (value) {
            const { StartDate } = this.parent;
            return !StartDate || value !== null;
        })
            .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
        Status: Yup.string().default('Active').required('Status is required'),
    });
};
exports.addProjectValidationSchema = addProjectValidationSchema;
exports.addResourceValidationSchema = Yup.object({
    Resource: Yup.string().required("Resource is required"),
    Type: Yup.string().required("Type is required"),
    Skills: Yup.string().required("Skills are required"),
});
exports.addAllocationValidationSchema = Yup.object({
    Resource: Yup.array()
        .of(Yup.string())
        .min(1, 'You must select at least one Resource')
        .required('Resource is required'),
    Project: Yup.array()
        .of(Yup.string())
        .min(1, 'You must select at least one Project')
        .required('Project is required'),
    StartDate: Yup.date().required("Start date is required"),
    EndDate: Yup.date().required("End date is required").min(Yup.ref("StartDate"), "End date must be after or equal to start date"),
    AllocationEntered: Yup.number()
        .required("Allocation is required")
        .min(0, "Allocation must be a positive number")
        .max(1, "Allocation cannot exceed 1.0"),
});
exports.assignAllocationValidationSchema = Yup.object({
    Resource: Yup.string().required("Resource is required"),
    Project: Yup.string().required("Project is required"),
    StartDate: Yup.date().required("Start date is required"),
    EndDate: Yup.date()
        .required("End date is required")
        .min(Yup.ref("StartDate"), "End date must be after or equal to start date"),
    Hours: Yup.number().required("Hours are required").positive("Hours must be positive"),
});
