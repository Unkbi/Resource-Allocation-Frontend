"use client";
import { saveRefreshToken, saveToken } from "@/app/utils/authUtils";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallbackContent() {
    const searchParams = useSearchParams();
    const route = useRouter();
    const idToken = searchParams.get("id_token");
    const refreshToken = searchParams.get("refresh_token");

    useEffect(() => {
        if (idToken && refreshToken) {
            saveToken(idToken);
            saveRefreshToken(refreshToken);
            route.push("/allocation")
        }
    }, [idToken, refreshToken])

    return <p></p>;
}