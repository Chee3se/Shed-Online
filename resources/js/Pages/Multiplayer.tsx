import React, { useEffect, useState, useCallback } from 'react';
import Layout from "@/Layouts/Layout";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {channel} from "node:diagnostics_channel";

interface Player {
    id: number;
    name: string;
}

export default function Multiplayer({ auth, code }: { auth: any; code: string; }) {
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        window.axios.defaults.headers.common['X-Socket-ID'] = window.Echo.socketId();
        const channel = window.Echo.join(`lobby.${code}`)
            .here((users: Player[]) => {
                console.log(users, ' here');
                setPlayers(users);
            })
            .joining((user: Player) => {
                console.log(user, ' joined');
                setPlayers((prevPlayers) => [...prevPlayers, user]);
            })
            .leaving((user: Player) => {
                console.log(user, ' left');
                setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== user.id));
            })
        return () => {
            window.Echo.leave(`lobby.${code}`);
        }
    },[]);

    return (
        <Layout auth={auth}>
            <Head title="Multiplayer Game" />
                <h1>Hello players {players.map((player)=>{
                    return player.name+" "
                })}</h1>

        </Layout>
    );
}
