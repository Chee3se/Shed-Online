import React from 'react';
import {Head, Link} from "@inertiajs/react";
import Layout from '../Layouts/Layout';

const Home = ({auth}) => {


    return (
        <Layout auth={auth}>
            <Head title="Home" />
            <div>
                <h1>Play cards</h1>
            </div>
        </Layout>
    );
};

export default Home;
