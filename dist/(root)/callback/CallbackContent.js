"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CallbackContent;
const authUtils_1 = require("@/app/utils/authUtils");
const navigation_1 = require("next/navigation");
const react_1 = require("react");
function CallbackContent() {
    const searchParams = (0, navigation_1.useSearchParams)();
    const route = (0, navigation_1.useRouter)();
    const idToken = searchParams.get("id_token");
    const refreshToken = searchParams.get("refresh_token");
    (0, react_1.useEffect)(() => {
        if (idToken && refreshToken) {
            (0, authUtils_1.saveToken)(idToken);
            (0, authUtils_1.saveRefreshToken)(refreshToken);
            route.push("/allocation");
        }
    }, [idToken, refreshToken]);
    return React.createElement("p", null);
}
