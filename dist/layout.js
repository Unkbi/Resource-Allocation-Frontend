"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommonLayout;
const react_1 = require("react");
require("./styles/globals.css");
const StoreProvider_1 = __importDefault(require("./StoreProvider"));
const v15_appRouter_1 = require("@mui/material-nextjs/v15-appRouter");
const ThemeRegistry_1 = __importDefault(require("./theme/ThemeRegistry"));
const Sidebar_1 = __importDefault(require("./components/Shared/Sidebar/Sidebar"));
const Header_1 = __importDefault(require("./components/Shared/Header/Header"));
const navigation_1 = require("next/navigation");
const material_1 = require("@mui/material");
const authUtils_1 = require("./utils/authUtils");
const constants_1 = require("./constants/constants");
const authActions_1 = require("./redux/actions/authActions");
const react_redux_1 = require("react-redux");
const MuiLicenceKey_1 = __importDefault(require("./components/MuiLicence/MuiLicenceKey"));
const MainContent = (0, material_1.styled)(material_1.Box, {
    shouldForwardProp: (prop) => !['isLoggedIn', 'sidebarExpanded'].includes(prop),
})(({ theme, isLoggedIn, sidebarExpanded }) => {
    return {
        background: '#fff',
        marginLeft: isLoggedIn ? (sidebarExpanded ? '276px' : '74px') : '0',
        paddingTop: `${isLoggedIn ? '52px' : '0'}`,
        transition: 'margin-left 0.3s ease-in-out',
    };
});
function LayoutContent({ children }) {
    const isLoggedIn = (0, authUtils_1.getToken)();
    const [isClient, setIsClient] = (0, react_1.useState)(false);
    const pathname = (0, navigation_1.usePathname)();
    const [isUserLoginIn, setIsUserLoginIn] = (0, react_1.useState)(null);
    const [sidebarExpanded, setSidebarExpanded] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const dispatch = (0, react_redux_1.useDispatch)();
    const isPublicRoute = constants_1.PUBLIC_ROUTES.includes(pathname);
    (0, react_1.useEffect)(() => {
        setIsClient(true);
    }, []);
    (0, react_1.useEffect)(() => {
        const getTitleByPath = (pathname) => {
            switch (pathname) {
                case '/allocation':
                    return 'Allocation';
                case '/project':
                    return 'Projects';
                case '/people':
                    return 'People';
                case '/report':
                    return 'Reports';
                default:
                    return 'Dashboard';
            }
        };
        document.title = getTitleByPath(pathname);
    }, [pathname]);
    (0, react_1.useEffect)(() => {
        if (!isClient)
            return;
        if (isLoggedIn && isPublicRoute) {
            router.replace('/allocation');
        }
        else if (!isLoggedIn && !isPublicRoute) {
            router.replace('/login');
        }
    }, [isLoggedIn, isPublicRoute, router, isClient]);
    (0, react_1.useEffect)(() => {
        if (!isClient)
            return;
        if (isLoggedIn) {
            setIsUserLoginIn(isLoggedIn);
            dispatch((0, authActions_1.getUserData)());
        }
    }, [dispatch, isLoggedIn, isClient]);
    return (React.createElement(React.Fragment, null,
        !isPublicRoute && React.createElement(Header_1.default, { isExpanded: sidebarExpanded, sidebarExpanded: sidebarExpanded, toggleSidebar: () => setSidebarExpanded((prev) => !prev) }),
        !isPublicRoute && React.createElement(Sidebar_1.default, { sidebarExpanded: sidebarExpanded, toggleSidebar: () => setSidebarExpanded((prev) => !prev) }),
        React.createElement(MainContent, { isLoggedIn: isUserLoginIn, sidebarExpanded: sidebarExpanded }, children),
        React.createElement(MuiLicenceKey_1.default, null)));
}
function CommonLayout({ children }) {
    return (React.createElement("html", { lang: "en", suppressHydrationWarning: true },
        React.createElement("body", null,
            React.createElement(StoreProvider_1.default, null,
                React.createElement(v15_appRouter_1.AppRouterCacheProvider, null,
                    React.createElement(ThemeRegistry_1.default, null,
                        React.createElement(LayoutContent, null, children)))))));
}
