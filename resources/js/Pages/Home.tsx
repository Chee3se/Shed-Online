import React from 'react';
import { Head, Link } from "@inertiajs/react";
import Layout from '../Layouts/Layout';

export default function Home({ auth }: { auth: any }) {
    return (
        <Layout auth={auth}>
            <Head title="Home" />
            <div>
                <h1>Play cards</h1>
            </div>
        </Layout>
    );
}
