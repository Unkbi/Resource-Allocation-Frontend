"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const material_1 = require("@mui/material");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const react_redux_1 = require("react-redux");
const ClickAwayListener_1 = __importDefault(require("@mui/material/ClickAwayListener"));
const Grow_1 = __importDefault(require("@mui/material/Grow"));
const Paper_1 = __importDefault(require("@mui/material/Paper"));
const Popper_1 = __importDefault(require("@mui/material/Popper"));
const MenuList_1 = __importDefault(require("@mui/material/MenuList"));
const authActions_1 = require("@/app/redux/actions/authActions");
const material_2 = require("@mui/material");
const MainBox = (0, material_1.styled)(material_1.Box, {
    shouldForwardProp: (prop) => prop !== 'sidebarExpanded',
})(({ theme, sidebarExpanded }) => ({
    width: sidebarExpanded ? "276px" : "74px",
    position: "fixed",
    left: "0",
    top: "0",
    zIndex: '1000',
    backgroundColor: theme.custom.bgColor,
    height: "100vh",
    color: theme.custom.secondryColor,
    paddingTop: "10px",
    textAlign: "center",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'width 0.3s ease',
    "& .menuList": {
        display: 'flex',
        flexDirection: "column",
        padding: "0",
        alignItems: "center",
        opacity: "0.6",
        padding: "8px 2px",
        cursor: "pointer",
        "&.active": {
            opacity: "1",
            backgroundColor: theme.custom.ternaryColor,
            margin: "7px",
            borderRadius: "4px",
        },
        flexDirection: sidebarExpanded ? 'row' : 'column',
        justifyContent: sidebarExpanded ? 'flex-start' : 'center',
        paddingLeft: sidebarExpanded ? '10px' : '0',
    },
    "& .logo": {
        paddingTop: "4px",
    },
    "& .profle-img": {
        width: "40px",
        height: "40px",
        marginLeft: sidebarExpanded ? "4px" : "",
    },
    "& .down-img": {
        padding: '6px',
    },
    "& .items-parent": {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
    },
    "& .menuList img": {
        width: "24px",
        height: "24px",
    },
    "& .profileMenu": {
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
        marginTop: "12px",
        minWidth: "160px",
        marginLeft: sidebarExpanded ? "0px" : "-7px",
        marginBottom: sidebarExpanded ? "" : "4px",
        "& li": {
            color: ' #95979E',
            backgroundColor: '#0D1F52',
            fontFamily: "Open Sans",
            fontsize: '14px',
            fontStyle: ' normal',
            fontweight: '400',
            lineheight: 'normal',
            marginLeft: '0px',
            "& .MuiTouchRipple-root": {
                display: "none"
            },
            "&.Mui-focusVisible": {
                backgroundColor: '#FFFFFF',
            }
        }
    }
}));
const Sidebar = ({ toggleSidebar, sidebarExpanded }) => {
    const [selectedMenu, setSelectedMenu] = (0, react_1.useState)('allocation');
    const [open, setOpen] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const dispatch = (0, react_redux_1.useDispatch)();
    const anchorRef = (0, react_1.useRef)(null);
    const { user } = (0, react_redux_1.useSelector)((state) => state.user);
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };
    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        }
        else if (event.key === 'Escape') {
            setOpen(false);
        }
    }
    const handleClose = (event) => {
        if (anchorRef.current?.contains(event.target)) {
            return;
        }
        setOpen(false);
    };
    const prevOpen = (0, react_1.useRef)(open);
    (0, react_1.useEffect)(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);
    const handleLogout = () => {
        dispatch((0, authActions_1.performLogout)());
        router.push("/login");
    };
    const menuItems = [
        { icon: "/images/icons/DashboardRounded.svg", text: "Dashboard", url: "/", disabled: false },
        { icon: "/images/icons/WatchLaterRoundedd.svg", text: "Allocation", url: "/allocation", disabled: false },
        { icon: "/images/icons/FolderFileOpen.svg", text: "Projects", url: "/project", disabled: false },
        { icon: "/images/icons/SupervisedUserCircleRounded.svg", text: "People", url: "/people", disabled: true },
        { icon: "/images/icons/PollRounded.svg", url: "/report", text: "Reports", disabled: true },
    ];
    const extraMenuItems = [
        { icon: "/images/icons/Notifications.svg", text: "Notification", url: "/notifications", disabled: true },
        { icon: "/images/icons/SettingsIcon.svg", text: "Settings", url: "/settings", disabled: true },
        { icon: "/images/icons/Vectorr.svg", text: "User Profile", url: "/profile", disabled: true },
        { icon: "/images/icons/helpIcon.svg", text: "Help Center", url: "/help", disabled: true },
    ];
    (0, react_1.useEffect)(() => {
        const currentMenuItem = [...menuItems, ...extraMenuItems].find(item => item.url === pathname);
        if (currentMenuItem) {
            setSelectedMenu(currentMenuItem.url);
        }
    }, [pathname]);
    const handleMenuClick = (url, disabled) => {
        if (disabled)
            return;
        setSelectedMenu(url);
        router.push(url);
    };
    // const {FirstName ,LastName} = user | {} ; might need in future
    return (React.createElement(MainBox, { className: "main-parent", sidebarExpanded: sidebarExpanded },
        React.createElement(material_1.Box, { className: 'logo', sx: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1px 17px', height: '76px' } },
            React.createElement(material_1.Box, { className: "logo-parent", sx: {
                    display: 'flex',
                    flexDirection: sidebarExpanded ? 'row' : 'column',
                    alignItems: 'center',
                    height: '90px',
                    width: '200px',
                    justifyContent: 'space-between',
                    gap: sidebarExpanded ? '20px' : '0',
                    marginRight: sidebarExpanded ? "40px" : '',
                } },
                React.createElement(link_1.default, { href: '' },
                    React.createElement("img", { alt: "cio-logo", src: "/images/icons/cio-logo.svg" })),
                React.createElement("img", { alt: "CIO-Image", src: "/images/icons/CIOptimize.svg", style: {
                        display: sidebarExpanded ? 'flex' : 'none',
                    } }),
                React.createElement(material_2.Button, { onClick: toggleSidebar, sx: {
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.3s ease-in-out, gap 0.3s ease-in-out',
                        transform: `translateY(${sidebarExpanded ? '0' : '4px'})`,
                        justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                        width: '100%',
                        marginBottom: '10px',
                        marginLeft: sidebarExpanded ? '3px' : '',
                        padding: '0px',
                    } },
                    React.createElement("img", { src: "/images/icons/sidebar-left.svg", className: "expand-img", alt: '', style: {
                            marginRight: sidebarExpanded ? '10px' : '0',
                        } }),
                    sidebarExpanded && (React.createElement(material_1.Typography, { sx: {
                            fontSize: '14px',
                            fontWeight: '500',
                            color: "silver",
                            textTransform: "none",
                            display: sidebarExpanded ? 'none' : 'block',
                        } }, "Collapse")))),
            React.createElement("img", { src: "/images/icons/line1-expand.svg" })),
        React.createElement(material_1.Box, { className: "items-parent" },
            React.createElement(material_1.Box, { className: "items-parent-wrapper" },
                React.createElement(material_1.Box, { className: "menu-items-parent", sx: { marginTop: '15px', } },
                    React.createElement(material_1.List, null, menuItems.map((item, index) => (React.createElement(material_1.MenuItem, { className: `menuList ${selectedMenu === item.url ? 'active' : ''}`, key: index, onClick: () => handleMenuClick(item.url, item.disabled), sx: {
                            opacity: item.disabled ? 0.5 : 1,
                            cursor: item.disabled ? 'not-allowed' : 'pointer',
                            margin: "8px",
                            color: '#95979E'
                        } },
                        React.createElement("img", { src: item.icon, alt: item.text, sx: { width: '16px', height: '16px' } }),
                        sidebarExpanded && React.createElement(material_1.Typography, { sx: { marginLeft: '10px' } }, item.text)))))),
                sidebarExpanded && (React.createElement(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', marginBottom: ' 100px', } },
                    React.createElement("img", { src: "/images/icons/line2-expand.svg", alt: "Divider" })))),
            React.createElement(material_1.Box, { className: "extra-menuitems-parent", sx: { marginTop: '0px', paddingTop: '20px' } },
                React.createElement(material_1.Box, { sx: {
                        paddingTop: "0px",
                        marginTop: '0px',
                    } }),
                React.createElement(material_1.Box, { sx: {
                        marginTop: '15px',
                    } },
                    React.createElement(material_1.Box, { className: "profile-section" },
                        React.createElement(material_1.Box, { lineHeight: '10px', onClick: handleToggle, ref: anchorRef, id: "composition-button", "aria-controls": open ? 'composition-menu' : undefined, sx: { cursor: 'pointer',
                                marginBottom: "9px",
                                display: 'flex',
                                alignItems: 'center',
                                gap: sidebarExpanded ? '15px' : '0',
                                marginLeft: sidebarExpanded ? "10px" : "17px",
                                width: sidebarExpanded ? '250px' : '',
                                height: sidebarExpanded ? '52px' : '',
                                borderRadius: "8px",
                                '&:hover': {
                                    background: '#0D1F52',
                                },
                                '&.active': {
                                    background: '#0D1F52',
                                },
                            }, className: selectedMenu === '/profile' ? 'active' : '' },
                            React.createElement("img", { src: "/images/icons/profile.svg", className: "profle-img", alt: '' }),
                            sidebarExpanded && (React.createElement(material_1.Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '30px' } }, sidebarExpanded && (React.createElement(React.Fragment, null,
                                React.createElement(material_1.Typography, { sx: {
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#95979E',
                                        padding: '2px',
                                    } },
                                    user && user.FirstName && user.LastName
                                        ? `${user.FirstName.charAt(0).toUpperCase() + user.FirstName.slice(1).toLowerCase()} ${user.LastName.charAt(0).toUpperCase() + user.LastName.slice(1).toLowerCase()}`
                                        : '',
                                    "   ",
                                    user.Email),
                                React.createElement("img", { src: open ? "/images/icons/iconUp.svg" : "/images/icons/icon.svg", className: "down-img", alt: "" })))))),
                        React.createElement(Popper_1.default, { open: open, anchorEl: anchorRef.current, role: undefined, placement: "top-start", transition: true, disablePortal: true, modifiers: [
                                {
                                    name: "offset",
                                    options: {
                                        offset: [0, 2],
                                    },
                                },
                            ] }, ({ TransitionProps, placement }) => (React.createElement(Grow_1.default, { ...TransitionProps, style: {
                                transformOrigin: sidebarExpanded
                                    ? "left bottom"
                                    : "left top",
                                marginTop: sidebarExpanded ? "-12px" : "-4px",
                            } },
                            React.createElement(Paper_1.default, { className: "profileMenu", sx: {
                                    display: "flex",
                                    width: sidebarExpanded ? "250px" : "230px",
                                    padding: "16px",
                                    flexDirection: "column",
                                    marginLeft: "-9px",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.06)",
                                    background: '#0D1F52',
                                } },
                                React.createElement(ClickAwayListener_1.default, { onClickAway: handleClose },
                                    React.createElement(MenuList_1.default, { autoFocusItem: open, id: "composition-menu", "aria-labelledby": "composition-button", onKeyDown: handleListKeyDown },
                                        extraMenuItems.map((item, index) => (React.createElement(material_1.MenuItem, { key: index, onClick: () => handleMenuClick(item.url, item.disabled), disabled: item.disabled, sx: {
                                                cursor: item.disabled ? "not-allowed" : "pointer",
                                                opacity: item.disabled ? 0.5 : 1,
                                                background: '#0D1F52',
                                                marginBottom: "6px",
                                                marginLeft: "0px",
                                            } },
                                            React.createElement("img", { src: item.icon, alt: item.text, style: { width: "16px", height: "16px", marginRight: "10px" } }),
                                            item.text))),
                                        React.createElement("div", null),
                                        React.createElement(material_1.MenuItem, { onClick: handleLogout },
                                            React.createElement("img", { src: "/images/icons/exiticon.svg", alt: "Logout", style: { width: "16px", height: "16px", marginRight: "10px", color: ' #95979E',
                                                    fontFamily: "Open Sans",
                                                    fontsize: '14px',
                                                    fontStyle: ' normal',
                                                    fontweight: '400',
                                                    lineheight: 'normal',
                                                } }),
                                            "Logout")))))))),
                    React.createElement(material_1.Box, { className: "logout", sx: { display: "flex",
                            justifyContent: sidebarExpanded ? 'start' : 'center',
                            alignItems: 'center',
                            width: '100%',
                        } }))))));
};
exports.default = Sidebar;
