"use client";

import { saveRefreshToken, saveToken } from "@/app/utils/authUtils";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Callback() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const idToken = searchParams.get("id_token");
        const refreshToken = searchParams.get("refresh_token");
        if (idToken) {
            saveToken(idToken);
            if (refreshToken) {
                saveRefreshToken(refreshToken);
            }
        }
    }, []);

    return <></>;
}