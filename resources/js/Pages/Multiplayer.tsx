import React, { useEffect, useState, useCallback } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function Multiplayer({ auth, gameId, initialPlayers }: { auth: any; gameId: string; initialPlayers: any[] }) {

    return (
        <Layout auth={auth}>
            <Head title="Multiplayer Game" />
                <h1>Hello players</h1>
        </Layout>
    );
}
