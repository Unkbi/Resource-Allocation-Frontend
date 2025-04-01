"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const Search_1 = __importDefault(require("@mui/icons-material/Search"));
const ClickAwayListener_1 = __importDefault(require("@mui/material/ClickAwayListener"));
const Grow_1 = __importDefault(require("@mui/material/Grow"));
const Paper_1 = __importDefault(require("@mui/material/Paper"));
const Popper_1 = __importDefault(require("@mui/material/Popper"));
const MenuItem_1 = __importDefault(require("@mui/material/MenuItem"));
const MenuList_1 = __importDefault(require("@mui/material/MenuList"));
const navigation_1 = require("next/navigation");
const react_redux_1 = require("react-redux");
const Close_1 = __importDefault(require("@mui/icons-material/Close")); // Close icon import
const dialogReducer_1 = require("@/app/redux/reducers/dialogReducer");
const AllocationForm_1 = __importDefault(require("../../AllocationTable/components/AllocationForm"));
const MainAppBar = (0, material_1.styled)(material_1.AppBar, {
    shouldForwardProp: (prop) => prop !== 'sidebarExpanded',
})(({ theme, sidebarExpanded }) => ({
    marginLeft: sidebarExpanded ? '276px' : '74px',
    width: `calc(100% - ${sidebarExpanded ? '276px' : '74px'})`,
    transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
    zIndex: '91',
    boxShadow: '0 1px 0 0 #DDE1E4',
    background: '#EBEFFC',
    '& h6': {
        color: theme.custom.primaryColor,
        fontFamily: "'Manrope', serif",
        // fontFamily: "Open Sans",
        fontWeight: 'SemiBold',
        fontSize: '18px',
        lineHeight: '22px',
    },
    '& .searchBar': {
        backgroundColor: '#FFFFFF',
        border: '1px solid #D6DCE1',
        boxShadow: '0 1px 0 0 #DDE1E4',
        borderRadius: '4px',
        width: '445px',
        height: '33px',
        transition: 'width 0.3s ease-in-out',
        '& input': {
            padding: '2px 10px',
            fontSize: '12px',
            color: '#757575',
            width: '410px',
            // height: "32px",
            height: '30px',
            boxSizing: 'border-box',
            color: '#212121',
        },
        '& .MuiInputBase-adornedStart': {
            display: 'flex',
            flexDirection: 'row-reverse',
        },
        '& svg': {
            width: '20px',
            marginRight: '5px',
        },
    },
    '& .toobarRow': {
        minHeight: '54px',
        paddingLeft: '15px',
        paddingRight: '15px',
    },
    "& .settingIcon": {
        padding: "0",
        borderRadius: "5px",
    },
}));
const Header = ({ sidebarExpanded }) => {
    const [openAddMenu, setOpenAddMenu] = react_1.default.useState(false);
    const anchorRefAdd = react_1.default.useRef(null);
    const anchorRef = react_1.default.useRef(null);
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const dispatch = (0, react_redux_1.useDispatch)();
    const handleAddMenuToggle = () => {
        setOpenAddMenu(prevOpen => !prevOpen);
    };
    const handleClose = event => {
        if (anchorRef.current?.contains(event.target) ||
            anchorRefAdd.current?.contains(event.target)) {
            return;
        }
        setOpenAddMenu(false);
    };
    function handleListKeyDown(event) {
        if (event.key === 'Tab' || event.key === 'Escape') {
            event.preventDefault();
            setOpenAddMenu(false);
        }
    }
    // return focus to the button when we transitioned from !open -> open
    const prevOpenAdd = react_1.default.useRef(openAddMenu);
    react_1.default.useEffect(() => {
        if (prevOpenAdd.current === true && openAddMenu === false) {
            anchorRefAdd.current.focus();
        }
        prevOpenAdd.current = openAddMenu;
    }, [openAddMenu]);
    const menuItems = [
        {
            icon: '/images/icons/AllocationIcon.svg',
            alt: 'Allocation Icon',
            title: 'Add Allocation',
            type: 'add_allocation',
        },
        {
            icon: '/images/icons/ProjectIcon.svg',
            alt: 'Project Icon',
            title: 'Add Project',
            type: 'add_project',
        },
        {
            icon: '/images/icons/TeamIcon.svg',
            alt: 'Team Icon',
            title: 'Add Team',
            type: 'add_team',
        },
        {
            icon: '/images/icons/ResourceIcon.svg',
            alt: 'Resource Icon',
            title: 'Add Resource',
            type: 'add_resource',
        },
        {
            icon: '/images/icons/corporate_fare.svg',
            alt: 'Organization Icon',
            title: 'Add Organization',
            type: 'add_organization',
        },
    ];
    const handleOpenDialog = (title, formType) => {
        setOpenAddMenu(false);
        dispatch((0, dialogReducer_1.openDialog)({
            title: title,
            submitButtonText: 'Add',
            cancelButtonText: 'Cancel',
            formType: formType,
            initialData: null,
        }));
    };
    const getTitleFromPathname = (pathname) => {
        switch (pathname) {
            case '/allocation':
                return 'Resource Allocation';
            case '/project':
                return 'Projects';
            case '/people':
                return 'People';
            case '/report':
                return 'Reports';
            case '/settings':
                return;
            case '/notifications':
                return;
            case '/help':
                return;
            default:
                return 'Executive Dashboard';
        }
    };
    return (react_1.default.createElement(MainAppBar, { sidebarExpanded: sidebarExpanded },
        react_1.default.createElement(material_1.Toolbar, { className: "toobarRow" },
            react_1.default.createElement(material_1.Typography, { variant: "h6" }, getTitleFromPathname(pathname)),
            react_1.default.createElement(material_1.Box, { display: 'flex', alignItems: 'center', ml: 'auto', gap: '20px' },
                react_1.default.createElement(material_1.Box, { className: "searchBar" },
                    react_1.default.createElement(material_1.TextField, { placeholder: "Search...", size: "small", InputProps: {
                            startAdornment: (react_1.default.createElement(material_1.InputAdornment, { position: "end" },
                                react_1.default.createElement(Search_1.default, null))),
                            disableUnderline: true,
                        }, variant: "standard" })),
                react_1.default.createElement(material_1.IconButton, { className: "settingIcon", onClick: handleAddMenuToggle, ref: anchorRefAdd, sx: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "30px",
                        height: "30px",
                        backgroundColor: "#0A1B39",
                        borderRadius: "8px",
                        '&:hover': {
                            backgroundColor: "#0A1B39",
                        },
                        '&:focus': {
                            backgroundColor: "#0A1B39",
                        },
                    } }, openAddMenu ? (react_1.default.createElement(Close_1.default, { sx: { color: '#fff', width: 22, height: 30 } })) : (react_1.default.createElement("img", { src: "/images/icons/addbutton.svg", alt: '', width: 30 }))))),
        react_1.default.createElement(Popper_1.default, { open: openAddMenu, anchorEl: anchorRefAdd.current, role: undefined, placement: "bottom-start", transition: true, disablePortal: true }, ({ TransitionProps, placement }) => (react_1.default.createElement(Grow_1.default, { ...TransitionProps, style: {
                transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
            } },
            react_1.default.createElement(Paper_1.default, { className: "AddMenu", sx: {
                    boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.06)',
                } },
                react_1.default.createElement(ClickAwayListener_1.default, { onClickAway: handleClose },
                    react_1.default.createElement(MenuList_1.default, { autoFocusItem: openAddMenu, id: "Add-menu", "aria-labelledby": "Add-button", onKeyDown: handleListKeyDown, sx: {
                            gap: '8px',
                            margin: ' 5px',
                            paddingTop: '18px',
                            paddingBottom: '12px',
                        } }, menuItems.map((item, index) => (react_1.default.createElement(MenuItem_1.default, { key: index, onClick: () => handleOpenDialog(item.title, item.type), sx: {
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: 2,
                            paddingBottom: 2,
                            gap: 1,
                        } },
                        react_1.default.createElement("img", { src: item.icon, alt: item.alt, width: 20, style: { marginRight: 8 } }),
                        item.title))))))))),
        react_1.default.createElement(AllocationForm_1.default, null)));
};
exports.default = Header;
