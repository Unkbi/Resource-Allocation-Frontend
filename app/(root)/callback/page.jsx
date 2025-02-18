"use client";

import { Suspense, useEffect } from "react";
import { saveRefreshToken, saveToken } from "@/app/utils/authUtils";
import { useSearchParams } from "next/navigation";

function CallbackContent() {
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
    }, [searchParams]);

    return null;
}


export default function Callback() {
    return (
        <Suspense fallback={null}>
            <CallbackContent />
        </Suspense>
    );
}